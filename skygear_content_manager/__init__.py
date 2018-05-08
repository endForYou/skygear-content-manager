import json
import logging
import tempfile
import yaml

from marshmallow import ValidationError
import requests
import skygear
from skygear import static_assets
from skygear.options import options
from skygear.utils.assets import directory_assets
from urllib.parse import parse_qs

from .import_export import (RecordSerializer, RecordDeserializer,
                            RecordIdentifierMap, render_header,
                            render_data,
                            prepare_import_records, import_records)
from .import_export import prepare_response as prepare_export_response
from .models.cms_config import (CMSConfig, CMSRecord,
                                CMSRecordBackReference,
                                CMSRecordAssociationReference)
from .push_notifications import cms_push_notification_db_init
from .push_notifications import register_lambda as register_push_notifications_lambda
from .schema.cms_config import CMSAssociationRecordSchema, CMSConfigSchema
from .schema.skygear_schema import SkygearSchemaSchema
from .settings import (CMS_USER_PERMITTED_ROLE, CMS_SKYGEAR_ENDPOINT,
                       CMS_SKYGEAR_API_KEY, CMS_PUBLIC_URL, CMS_STATIC_URL,
                       CMS_SITE_TITLE, CMS_CONFIG_FILE_URL)
from .skygear_utils import (SkygearRequest, SkygearResponse, AuthData,
                            request_skygear, get_schema, save_records,
                            fetch_records, eq_predicate)


cms_config = None
logger = logging.getLogger(__name__)


def includeme(settings):
    register_push_notifications_lambda(settings)


    @skygear.event("before-plugins-ready")
    def before_plugins_ready(config):
        cms_push_notification_db_init(config)


    @skygear.event('after-plugins-ready')
    def after_plugins_ready(config):
        cms_config = CMSConfig.empty()
        try:
            cms_config = parse_cms_config()
        except Exception as e:
            logger.exception(e)

        set_cms_config(cms_config)


    @skygear.event('schema-changed')
    def schema_change(config):
        cms_config = CMSConfig.empty()
        try:
            cms_config = parse_cms_config()
        except Exception as e:
            logger.exception(e)

        set_cms_config(cms_config)


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
            return SkygearResponse.access_token_not_accepted().to_werkzeug()

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
        data = parse_qs(request.query_string.decode())
        name = data.get('export_name', [None])[0]
        key = data.get('key', [None])[0]
        predicate_string = data.get('predicate', [None])[0]

        if not key:
            return SkygearResponse.access_token_not_accepted().to_werkzeug()

        authdata = AuthData.from_cms_token(key)
        if not authdata:
            return SkygearResponse.access_token_not_accepted().to_werkzeug()

        cms_config = get_cms_config()
        export_config = cms_config.get_export_config(name)
        if not export_config:
            return skygear.Response('Export config not found', 404)

        record_type = export_config.record_type
        includes = export_config.get_direct_reference_fields()

        predicate = None
        if predicate_string:
            try:
                predicate = json.loads(predicate_string)
            except Exception:
                return skygear.Response('Invalid predicate', 400)

        records = fetch_records(record_type,
                                includes=includes,
                                predicate=predicate)

        csv_datas = []
        for record in records:
            transient_foreign_records(
                record,
                export_config,
                cms_config.association_records
            )
            csv_data = record_to_csv_data(record, export_config.fields)
            csv_datas.append(csv_data)

        serializer = RecordSerializer(export_config.fields)
        serializer.walk_through(csv_datas)
        serialized_data = [serializer.serialize(d) for d in csv_datas]

        response = prepare_export_response(name)
        render_header(response.stream, export_config, serializer)
        render_data(response.stream, serialized_data)
        return response


    @skygear.handler('cms-api/import')
    def import_data(request):
        files = request.files
        form = request.form
        key = form.get('key')

        if not key:
            return SkygearResponse.access_token_not_accepted().to_werkzeug()

        authdata = AuthData.from_cms_token(key)
        if not authdata:
            return SkygearResponse.access_token_not_accepted().to_werkzeug()

        if 'file' not in files:
            return skygear.Response('Missing file', 400)

        file = files['file']
        name = form.get('import_name')

        global cms_config
        import_config = cms_config.get_import_config(name)

        if not import_config:
            return skygear.Response('Import config not found', 404)

        temp_file = tempfile.NamedTemporaryFile(suffix='.csv')
        file.save(temp_file.name)

        records = None
        with open(temp_file.name, 'r') as fp:
            # skip first row
            next(fp)
            records = prepare_import_records(fp, import_config)

        resp = import_records(records)
        return resp


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
        options.skygear_endpoint + action_url[1:]

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

    association_records_data = config['association_records'] \
                               if 'association_records' in config \
                               else {}
    cms_records_data = config['records'] if 'records' in config else {}

    cms_records = {}
    for key, value in cms_records_data.items():
        record_type = value.get('record_type', key)
        cms_records[key] = CMSRecord(name=key, record_type=record_type)

    association_records = {}
    association_record_schema = CMSAssociationRecordSchema()
    for key, value in association_records_data.items():
        association_record_schema.context = {
            'name': key,
            'cms_records': cms_records,
        }
        association_records[key] = association_record_schema.load(value).data

    config_schema = CMSConfigSchema()
    config_schema.context = {
        'schema': schema,
        'association_records': association_records,
        'cms_records': cms_records,
    }
    result = config_schema.load(config)
    if result.errors:
        raise ValidationError(result.errors)

    cms_config = result.data
    cms_config.association_records = association_records
    cms_config.cms_records = cms_records
    return cms_config


def set_cms_config(_cms_config):
    global cms_config
    cms_config = _cms_config


def get_cms_config():
    global cms_config
    return cms_config


def record_to_csv_data(record, fields):
    """
    From dictionary to array based on field config
    """
    data = []
    for field in fields:
        if field.reference:
            if field.reference.is_many:
                ref_record = record['_transient'].get(field.name, []) or []
                ref_data = [record_to_csv_data(r, field.reference.target_fields) for r in ref_record]
            else:
                ref_record = record['_transient'].get(field.name, {}) or {}
                ref_data = record_to_csv_data(ref_record, field.reference.target_fields)

            data.append(ref_data)
        elif field.name == '_created_at' or field.name == '_updated_at':
            date_data = {
                '$type': 'date',
                '$date': record.get(field.name),
            }
            data.append(date_data)
        else:
            data.append(record.get(field.name))

    return data


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

        if isinstance(reference, CMSRecordAssociationReference):
            association_record = association_records[reference.association_record.name]

            foreign_field = \
                [f for f in association_record.fields
                 if f.target_cms_record.name == reference.target_reference][0]

            self_field = \
                [f for f in association_record.fields
                 if f.target_cms_record.name != reference.target_reference][0]

            predicate = eq_predicate(self_field.name, record_id)
            foreign_records = fetch_records(reference.association_record.record_type,
                                            predicate=predicate,
                                            includes=[foreign_field.name])
            records = \
                [r['_transient'][foreign_field.name] for r in foreign_records]
        elif isinstance(reference, CMSRecordBackReference):
            predicate = eq_predicate(reference.source_reference, record_id)
            records = fetch_records(reference.target_cms_record.record_type,
                                    predicate=predicate)
        else:
            # skip for direct reference
            continue

        record['_transient'][field.name] = records


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
    <script type="text/javascript" src="{CMS_STATIC_URL}tinymce/tinymce.min.js"></script>
    <script type="text/javascript" src="{CMS_STATIC_URL}static/js/main.js"></script>
    <script type="text/javascript">
      skygearCMS.start({{
        skygearEndpoint: "{CMS_SKYGEAR_ENDPOINT}",
        skygearApiKey: "{CMS_SKYGEAR_API_KEY}",
        cmsConfigUrl: "{CMS_CONFIG_FILE_URL}",
        publicUrl: "{CMS_PUBLIC_URL}",
        staticUrl: "{CMS_STATIC_URL}",
      }});
    </script>
  </body>
</html>
"""
