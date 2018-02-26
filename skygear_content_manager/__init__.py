import json
import logging
import os
import yaml

from jose import JWTError, jwt
from marshmallow import ValidationError
import requests
import skygear
from skygear import static_assets
from skygear.options import options
from skygear.utils.assets import directory_assets

from .import_export import RecordSerializer, render_records
from .import_export import prepare_response as prepare_export_response
from .models.cms_config import CMSConfig
from .schema.cms_config import CMSConfigSchema
from .schema.skygear_schema import SkygearSchemaSchema


logger = logging.getLogger('skygear_content_manager')

CMS_USER_PERMITTED_ROLE = os.environ.get('CMS_USER_PERMITTED_ROLE', 'Admin')
CMS_AUTH_SECRET = os.environ.get('CMS_AUTH_SECRET', 'FAKE_AUTH_SECRET')

# cms index params

CMS_SKYGEAR_ENDPOINT = \
    os.environ.get('CMS_SKYGEAR_ENDPOINT', 'http://localhost:3000/')
CMS_SKYGEAR_API_KEY = \
    os.environ.get('CMS_SKYGEAR_API_KEY', 'FAKE_API_KEY')
CMS_PUBLIC_URL = \
    os.environ.get('CMS_PUBLIC_URL', 'http://localhost:3000/cms')
CMS_STATIC_URL = \
    os.environ.get('CMS_STATIC_URL', 'http://localhost:3001/static/')
CMS_SITE_TITLE = \
    os.environ.get('CMS_SITE_TITLE', 'Skygear CMS')
CMS_CONFIG_FILE_URL = \
    os.environ.get('CMS_CONFIG_FILE_URL',
                   'http://localhost:3002/cms-config.yaml')

# other constants

REQUEST_HEADER_BLACKLIST = [
    'Host',
    'Accept-Encoding',
]
RESPONSE_HEADER_BLACKLIST = [
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Origin',
    'Content-Encoding',
    'Server',
]

cms_config = None


def includeme(settings):
    @skygear.event('after-plugins-ready')
    def after_plugins_ready(config):
        global cms_config
        try:
            cms_config = parse_cms_config()
        except Exception as e:
            cms_config = CMSConfig.empty()
            logger.error(e)


    @skygear.event('schema-changed')
    def schema_change(config):
        global cms_config
        try:
            cms_config = parse_cms_config()
        except Exception as e:
            cms_config = CMSConfig.empty()
            logger.error(e)


    @skygear.handler('cms/')
    def index(request):
        context = {
            'CMS_SKYGEAR_ENDPOINT': CMS_SKYGEAR_ENDPOINT,
            'CMS_SKYGEAR_API_KEY': CMS_SKYGEAR_API_KEY,
            'CMS_SITE_TITLE': CMS_SITE_TITLE,
            'CMS_STATIC_URL': CMS_STATIC_URL,
            'CMS_PUBLIC_URL': CMS_PUBLIC_URL,
            'CMS_CONFIG_FILE_URL': CMS_CONFIG_FILE_URL,
        }
        return skygear.Response(
            INDEX_HTML_FORMAT.format(**context),
            content_type='text/html',
        )


    @skygear.handler('cms-api/')
    def api(request):
        # log_request(request)

        req = SkygearRequest.from_werkzeug(request)

        if req.body.is_dict:
            if req.body.data.get('action') == 'auth:login':
                return intercept_login(req).to_werkzeug()
            elif req.body.data.get('action') == 'asset:put':
                return intercept_asset_put(req).to_werkzeug()

        cms_access_token = req.access_token
        if not cms_access_token:
            return request_skygear(req).to_werkzeug()

        authdata = AuthData.from_cms_token(cms_access_token)
        if not authdata:
            return SkygearResponse.forbidden().to_werkzeug()

        req.access_token = authdata.skygear_token

        if req.body.is_dict:
            if req.body.data.get('action') == 'me':
                return intercept_me(req).to_werkzeug()

        if not authdata.is_admin:
            return request_skygear(req).to_werkzeug()

        req.is_master = True
        return request_skygear(req).to_werkzeug()


    @skygear.handler('cms-api/export')
    def export(request):
        req = SkygearRequest.from_werkzeug(request)
        data = req.body.data
        name = data.get('export_name')

        global cms_config
        export_config = cms_config.get_export_config(name)
        if not export_config:
            return skygear.Response('Export config not found', 404)

        record_type = export_config.record_type
        includes = export_config.get_reference_targets()

        records = fetch_records(record_type, includes=includes)
        for record in records:
            transient_foreign_records(
                record,
                export_config,
                cms_config.association_records
            )

        serializer = RecordSerializer(export_config.fields)
        serialized_records = [serializer.serialize(r) for r in records]

        response = prepare_export_response(name)
        render_records(serialized_records, export_config, response.stream)
        return response


class SkygearRequest:

    method = None
    headers = {}
    body = None

    is_master = False

    def __init__(self, method, headers, body):
        self.method = method
        self.headers = headers
        self.body = body

    # req: skygear's wrapped werkzeug request
    @classmethod
    def from_werkzeug(cls, req):
        return cls(
            method=req.method,
            body=Body(req.data),
            headers={k: v for k, v in req.headers},
        )

    @property
    def access_token(self):
        if self.body.is_dict:
            access_token = self.body.data.get('access_token')
            if access_token:
                return access_token

        return self.headers.get('X-Skygear-Access-Token')

    @access_token.setter
    def access_token(self, access_token):
        if self.body.is_dict:
            self.body.data['access_token'] = access_token

        self.headers['X-Skygear-Access-Token'] = access_token

    def to_requests(self):
        method = self.method
        # TODO: should clone body here
        body = self.body
        headers = {
            k: v
            for k, v in self.headers.items()
            if k not in REQUEST_HEADER_BLACKLIST
        }

        if self.is_master:
            if body.is_dict:
                body.data['api_key'] = options.masterkey
            headers['X-Skygear-Api-Key'] = options.masterkey

        return requests.Request(
            method=method,
            url=options.skygear_endpoint,
            data=body.to_data(),
            headers=headers,
        )


class SkygearResponse:

    is_forbidden = False

    status_code = None
    headers = {}
    body = None

    # resp: requests response
    def __init__(self, status_code, headers, body, is_forbidden=False):
        self.is_forbidden = is_forbidden

        self.status_code = status_code
        self.headers = headers
        self.body = body

    @classmethod
    def forbidden(cls):
        return cls(
            status_code=None,
            headers=None,
            body=None,
            is_forbidden=True,
        )

    @classmethod
    def from_requests(cls, resp):
        status_code = resp.status_code
        body = Body(resp.content)
        headers = {k: v for k, v in resp.headers.items()}

        return cls(
            status_code=status_code,
            headers=headers,
            body=body,
        )

    @property
    def access_token(self):
        if self.body.is_dict:
            access_token = self.body.data.get('result', {}).get('access_token')
            if access_token:
                return access_token

        return self.headers.get('X-Skygear-Access-Token')

    @access_token.setter
    def access_token(self, access_token):
        if self.body.is_dict:
            self.body.data['result']['access_token'] = access_token

        self.headers['X-Skygear-Access-Token'] = access_token

    def to_werkzeug(self):
        if self.is_forbidden:
            return skygear.Response(
                'You are not permitted to access CMS',
                403
            )

        filtered_headers = [
            (k, v)
            for k, v in self.headers.items()
            if k not in RESPONSE_HEADER_BLACKLIST
        ]

        return skygear.Response(
            response=self.body.to_data(),
            status=str(self.status_code),
            headers=filtered_headers,
        )


class Body:

    KIND_JSON = 'json'
    KIND_OTHER = 'other'

    kind = KIND_OTHER
    data = None

    # b: bytes
    def __init__(self, b):
        if not b:
            self.data = b

        if isinstance(b, bytes):
            try:
                json_body = json.loads(b.decode('utf-8'))
            except json.decoder.JSONDecodeError:
                self.data = b
                return

            self.kind = self.KIND_JSON
            self.data = json_body
        elif isinstance(b, dict):
            self.kind = self.KIND_JSON
            self.data = b

    @property
    def is_json(self):
        return self.kind == self.KIND_JSON

    @property
    def is_dict(self):
        return self.is_json and isinstance(self.data, dict)

    def to_data(self):
        data = self.data

        if self.is_json:
            return json.dumps(data).encode('utf-8')

        return data


class AuthData:

    is_admin = False
    skygear_token = None

    def __init__(self, is_admin, skygear_token):
        self.is_admin = is_admin
        self.skygear_token = skygear_token

    @classmethod
    def from_cms_token(cls, cms_token):
        try:
            authdict = jwt.decode(
                cms_token,
                CMS_AUTH_SECRET,
                algorithms=['HS256'],
            )
        except JWTError:
            return None

        return cls(
            is_admin=authdict.get('is_admin', False),
            skygear_token=authdict.get('skygear_access_token', None)
        )

    def to_cms_token(self):
        return jwt.encode({
            'iss': 'skygear-content-manager',
            'skygear_access_token': self.skygear_token,
            'is_admin': self.is_admin,
        }, CMS_AUTH_SECRET, algorithm='HS256')


# req: SkygearRequest
def request_skygear(req):
    requests_req = req.to_requests()
    requests_resp = requests.Session().send(requests_req.prepare())
    return SkygearResponse.from_requests(requests_resp)


def request_skygear_api(action, data={}, is_master=True):
    body_dict = {
        'action': action,
        'api_key': options.masterkey,
    }
    body_dict.update(data)
    body = Body(body_dict)
    req = SkygearRequest('POST', {}, body)
    req.is_master = is_master
    return request_skygear(req)


def intercept_login(req):
    resp = request_skygear(req)

    if not (200 <= resp.status_code <= 299):
        return resp

    # unknown resp structure
    if not resp.body.is_dict:
        return SkygearResponse.forbidden()

    if not can_access_cms(resp):
        return SkygearResponse.forbidden()

    resp.access_token = AuthData(
        is_admin=True,
        skygear_token=resp.access_token,
    ).to_cms_token()

    return resp


def intercept_asset_put(req):
    resp = request_skygear(req)

    if not (200 <= resp.status_code <= 299):
        return resp

    # unknown resp structure
    if not resp.body.is_dict:
        return resp

    action_url = resp.body.data\
        .get('result', {})\
        .get('post-request', {})\
        .get('action', '')
    if not action_url.startswith('/'):
        return resp

    resp.body.data['result']['post-request']['action'] = \
        CMS_SKYGEAR_ENDPOINT + action_url[1:]

    return resp


def intercept_me(req):
    resp = request_skygear(req)

    if not (200 <= resp.status_code <= 299):
        return resp

    # unknown resp structure
    if not resp.body.is_dict:
        return SkygearResponse.forbidden()

    if not can_access_cms(resp):
        return SkygearResponse.forbidden()

    resp.access_token = AuthData(
        is_admin=True,
        skygear_token=resp.access_token,
    ).to_cms_token()

    return resp


def can_access_cms(resp):
    roles = get_roles(resp.body.data)

    # no roles field?
    if roles is None:
        return False

    if not isinstance(roles, list):
        return False

    return CMS_USER_PERMITTED_ROLE in roles


def get_roles(json_body):
    roles = json_body.get('result', {}).get('roles', None)
    if not isinstance(roles, list):
        return None

    return roles


def parse_cms_config():
    schema = SkygearSchemaSchema().load(get_schema()).data

    r = requests.get(CMS_CONFIG_FILE_URL)
    if not (200 <= r.status_code <= 299):
        raise Exception('Failed to get cms config yaml file')

    config = yaml.load(r.text)

    config_schema = CMSConfigSchema()
    config_schema.context = {'schema': schema}
    result = config_schema.load(config)
    if result.errors:
        raise ValidationError(result.errors)

    return result.data


def get_schema():
    resp = request_skygear_api('schema:fetch')
    return resp.body.data['result']


def fetch_records(record_type, predicate = None, includes = []):
    resp = request_skygear_api('record:query', data={
        'record_type': record_type,
        'database_id': '_union',
        'include': {i: {'$type': 'keypath', '$val': i} for i in includes},
        'predicate': predicate,
    })
    return resp.body.data['result']


def eq_predicate(key, value):
    return ['eq', {'$type': 'keypath', '$val': key}, value]


def transient_foreign_records(record, export_config, association_records):
    """
    Fetch and embed foreign records, with one-to-many or many-to-many
    relationship, to _transient of the record.

    For example, each "user" record has many "skill", with config field
    name "user_has_skill". This function would fetch "skill" records that
    are referenced by the "user" record, and embed the "skill" record list in
    user['_transient']['user_has_skill'].
    """
    reference_fields = export_config.get_many_reference_fields()
    record_id = record['_id'].split('/')[1]

    for field in reference_fields:
        reference = field.reference
        records = None

        if reference.name in record['_transient']:
            continue

        if reference.is_via_association_record:
            foreign_field = \
                [f for f in association_records[reference.name].fields
                 if f.target == reference.target][0]
            self_field = \
                [f for f in association_records[reference.name].fields
                 if f.target != reference.target][0]

            predicate = eq_predicate(self_field.name, record_id)
            foreign_records = fetch_records(reference.name,
                                            predicate=predicate,
                                            includes=[foreign_field.name])
            records = \
                [r['_transient'][foreign_field.name] for r in foreign_records]
        else:
            # TODO
            pass

        record['_transient'][reference.name] = records


INDEX_HTML_FORMAT = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <link rel="manifest" href="{CMS_STATIC_URL}manifest.json">
    <link rel="stylesheet" href="{CMS_STATIC_URL}css/bootstrap.min.css">
    <link rel="stylesheet" href="{CMS_STATIC_URL}static/css/main.css">
    <title>{CMS_SITE_TITLE}</title>
  </head>
  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
    <script type="text/javascript" src="{CMS_STATIC_URL}static/js/main.js"></script>
    <script type="text/javascript">
      skygearCMS.start({{
        skygearEndpoint: "{CMS_SKYGEAR_ENDPOINT}",
        skygearApiKey: "{CMS_SKYGEAR_API_KEY}",
        cmsConfigUrl: "{CMS_CONFIG_FILE_URL}",
        publicUrl: "{CMS_PUBLIC_URL}",
      }});
    </script>
  </body>
</html>
"""
