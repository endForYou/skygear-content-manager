import logging

import skygear
from ruamel.yaml import YAML
from skygear.options import options

from .cms_index_html import INDEX_HTML_FORMAT
from .config_loader import ConfigLoader
from .db import cms_db_init
from .file_import import register_lambda as register_file_import_lambda
from .generate_config import generate_config
from .import_export import register_lambdas as register_import_export_lambdas
from .push_notifications import \
    register_lambda as register_push_notifications_lambda
from .schema.skygear_schema import SkygearSchemaSchema
from .settings import CLIENT_SKYGEAR_ENDPOINT
from .settings import CMS_CONFIG_FILE_URL
from .settings import CMS_PUBLIC_URL
from .settings import CMS_SITE_TITLE
from .settings import CMS_SKYGEAR_API_KEY
from .settings import CMS_SKYGEAR_ENDPOINT
from .settings import CMS_STATIC_URL
from .settings import CMS_THEME_LOGO
from .settings import CMS_THEME_PRIMARY_COLOR
from .settings import CMS_THEME_SIDEBAR_COLOR
from .settings import CMS_USER_PERMITTED_ROLE
from .skygear_utils import AuthData
from .skygear_utils import SkygearRequest
from .skygear_utils import SkygearResponse
from .skygear_utils import get_schema
from .skygear_utils import request_skygear
from .skygear_utils import validate_master_user
from .werkzeug_utils import prepare_file_response

logger = logging.getLogger(__name__)
try:
    # Available in py-skygear v1.6
    from skygear.utils.logging import setLoggerTag
    setLoggerTag(logger, 'cms_plugin')
except ImportError:
    pass


def includeme(settings):
    register_cms_config_lambdas(settings)
    register_push_notifications_lambda(settings)
    register_file_import_lambda(settings)
    register_import_export_lambdas(settings)
    register_cms_proxy_handler(settings)

    @skygear.event("before-plugins-ready")
    def before_plugins_ready(config):
        cms_db_init(config)

    @skygear.event('schema-changed')
    def schema_change(config):
        ConfigLoader.get_instance().reset_schema()

    @skygear.handler('cms/')
    def index(request):
        context = {
            'CMS_SKYGEAR_ENDPOINT':
            CMS_SKYGEAR_ENDPOINT,
            'CMS_SKYGEAR_API_KEY':
            CMS_SKYGEAR_API_KEY,
            'CMS_SITE_TITLE':
            CMS_SITE_TITLE,
            'CMS_STATIC_URL':
            CMS_STATIC_URL,
            'CMS_PUBLIC_URL':
            CMS_PUBLIC_URL,
            'CMS_CONFIG_FILE_URL':
            ConfigLoader.get_instance().get_config_source(),
            'CMS_THEME_PRIMARY_COLOR':
            CMS_THEME_PRIMARY_COLOR,
            'CMS_THEME_SIDEBAR_COLOR':
            CMS_THEME_SIDEBAR_COLOR,
            'CMS_THEME_LOGO':
            CMS_THEME_LOGO if CMS_THEME_LOGO is not None else '',
            'CMS_USER_PERMITTED_ROLE':
            CMS_USER_PERMITTED_ROLE,
        }
        return skygear.Response(
            INDEX_HTML_FORMAT.format(**context),
            content_type='text/html',
        )


def register_cms_proxy_handler(settings):
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


def register_cms_config_lambdas(settings):
    @skygear.handler('cms-api/default-cms-config.yaml')
    def default_cms_config(request):
        schema = SkygearSchemaSchema().load(get_schema())
        default_config = generate_config(schema)
        response = prepare_file_response('cms-config.yaml', 'text/yaml')
        yaml = YAML()
        yaml.dump(default_config, response.stream)
        return response

    @skygear.handler('cms-api/reload-cms-config')
    def cms_config_file_url_api(request):
        validate_master_user()
        ConfigLoader.get_instance().set_config_source(CMS_CONFIG_FILE_URL)
        return {'result': 'OK'}


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

    endpoint = CLIENT_SKYGEAR_ENDPOINT or options.skygear_endpoint

    resp.body.data['result']['post-request']['action'] = \
        endpoint + action_url[1:]

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
