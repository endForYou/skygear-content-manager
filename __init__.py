import json
import os

from jose import JWTError, jwt
import requests
import skygear
from skygear import static_assets
from skygear.utils.assets import directory_assets


CMS_SKYGEAR_ENDPOINT = \
    os.environ.get('CMS_SKYGEAR_ENDPOINT', 'http://localhost:3000/')
CMS_SKYGEAR_MASTER_KEY = \
    os.environ.get('CMS_SKYGEAR_MASTER_KEY', 'FAKE_MASTER_KEY')
CMS_STATIC_ASSETS_PATH = \
    os.environ.get('CMS_STATIC_ASSETS_PATH', 'files')

CMS_USER_PERMITTED_ROLE = os.environ.get('CMS_USER_PERMITTED_ROLE', 'Admin')
CMS_AUTH_SECRET = os.environ.get('CMS_AUTH_SECRET', 'FAKE_AUTH_SECRET')

# cms index params

CMS_CSS_URL = \
    os.environ.get('CMS_CSS_URL', '')
CMS_JS_URL = \
    os.environ.get('CMS_JS_URL', '')
CMS_SITE_TITLE = \
    os.environ.get('REACT_APP_PUBLIC_URL', 'Skygear CMS')

# other constants

REQUEST_HEADER_BLACKLIST = [
    'Host',
]
RESPONSE_HEADER_BLACKLIST = [
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Origin',
    'Content-Encoding',
    'Server',
]


@skygear.handler('cms/')
def index(request):
    context = {
        'CMS_SKYGEAR_ENDPOINT': CMS_SKYGEAR_ENDPOINT,
        'CMS_CSS_URL': CMS_CSS_URL,
        'CMS_JS_URL': CMS_JS_URL,
        'CMS_SITE_TITLE': CMS_SITE_TITLE,
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
        return request_skygear(req).to_werkzeug()

    req.access_token = authdata.skygear_token

    if not authdata.is_admin:
        return request_skygear(req).to_werkzeug()

    req.is_master = True
    return request_skygear(req).to_werkzeug()


@static_assets('cms-static')
def hello_world():
    return directory_assets(CMS_STATIC_ASSETS_PATH)


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
                body.data['api_key'] = CMS_SKYGEAR_MASTER_KEY
            headers['X-Skygear-Api-Key'] = CMS_SKYGEAR_MASTER_KEY

        return requests.Request(
            method=method,
            url=CMS_SKYGEAR_ENDPOINT,
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

        try:
            json_body = json.loads(b.decode('utf-8'))
        except json.decoder.JSONDecodeError:
            self.data = b
            return

        self.kind = self.KIND_JSON
        self.data = json_body

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


INDEX_HTML_FORMAT = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <link rel="manifest" href="{CMS_SKYGEAR_ENDPOINT}cms-static/manifest.json">
    <link rel="stylesheet" href="{CMS_SKYGEAR_ENDPOINT}cms-static/css/bootstrap.min.css">
    <link rel="stylesheet" href="{CMS_CSS_URL}">
    <title>{CMS_SITE_TITLE}</title>
  </head>
  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
    <script type="text/javascript" src="{CMS_JS_URL}"></script>
  </body>
</html>
"""
