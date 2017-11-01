import json
import os

from jose import JWTError, jwt
import requests
import skygear


CMS_SKYGEAR_ENDPOINT = \
    os.environ.get('CMS_SKYGEAR_ENDPOINT', 'http://localhost:3000/')
CMS_SKYGEAR_MASTER_KEY = \
    os.environ.get('CMS_SKYGEAR_MASTER_KEY', 'FAKE_MASTER_KEY')

CMS_USER_PERMITTED_ROLE = os.environ.get('CMS_USER_PERMITTED_ROLE', 'Admin')
CMS_AUTH_SECRET = os.environ.get('CMS_AUTH_SECRET', 'FAKE_AUTH_SECRET')

HEADER_BLACKLIST = [
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Origin',
    'Server',
]


def requests_request(req, json_body=None, headers=None):
    return requests.Request(
        method=req.method,
        url=CMS_SKYGEAR_ENDPOINT,
        data=transform_request_body(json_body) if json_body else req.data,
        headers=headers if headers else transform_request_header(req.headers),
    )


@skygear.handler('cms/api/')
def api(request):
    # log_request(request)

    parsed_request_body = parse_body(request.data)

    # handle login request specially
    if (isinstance(parsed_request_body, dict) and
            parsed_request_body.get('action') == 'auth:login'):
        return intercept_login(request, parsed_request_body)

    requests_req = intercept_request_body(request, parsed_request_body)
    resp = requests.Session().send(requests_req.prepare())

    # log_response(resp)

    return transform_resp(resp)


def intercept_request_body(request, json_body):
    cms_access_token = json_body['access_token']
    try:
        authdict = jwt.decode(
            cms_access_token,
            CMS_AUTH_SECRET,
            algorithms=['HS256'],
        )
    except JWTError:
        return requests_request(request, json_body)

    if not authdict.get('is_admin', False):
        return requests_request(request, json_body)

    skygear_access_token = authdict['skygear_access_token']
    headers = transform_request_header(request.headers)

    json_body['access_token'] = skygear_access_token
    headers['X-Skygear-Access-Token'] = skygear_access_token

    return requests_request(
        request,
        json_body=json_body,
        headers=headers,
    )


def intercept_login(request, json_body):
    prepared = requests_request(request, json_body).prepare()
    resp = requests.Session().send(prepared)

    # log_response(resp)

    if not (200 <= resp.status_code <= 299):
        return transform_resp(resp)

    resp_body = parse_body(resp.content)

    # unknown resp structure
    if not isinstance(resp_body, dict):
        return forbidden_resp(resp)

    if not can_access_cms(resp_body):
        return forbidden_resp(resp)

    return authenticated_resp(resp, resp_body)


def authenticated_resp(resp, resp_json_body):
    skygear_access_token = resp_json_body['result']['access_token']

    cms_access_token = jwt.encode({
        'iss': 'skygear-content-manager',
        'skygear_access_token': skygear_access_token,
        'is_admin': True,
    }, CMS_AUTH_SECRET, algorithm='HS256')

    resp_json_body['result']['access_token'] = cms_access_token

    return skygear.Response(
        response=json.dumps(resp_json_body).encode('utf-8'),
        status=str(resp.status_code),
        headers=[
            (k, v)
            for k, v in resp.headers.items()
            if k not in HEADER_BLACKLIST
        ],
    )


def can_access_cms(resp_body):
    roles = get_roles(resp_body)

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


def forbidden_resp(requests_resp):
    return skygear.Response(
        'You are not permitted to access CMS',
        403
    )


def transform_resp(resp):
    return skygear.Response(
        response=resp.content,
        status=str(resp.status_code),
        headers=[
            (k, v)
            for k, v in resp.headers.items()
            if k not in HEADER_BLACKLIST
        ],
    )


def transform_request_header(environ_headers):
    # we are losing headers with multiple values here
    headers = dict((k, v) for k, v in environ_headers)
    headers['X-Skygear-Api-Key'] = CMS_SKYGEAR_MASTER_KEY

    return headers


def parse_body(b):
    if not b:
        return b

    try:
        json_body = json.loads(b.decode('utf-8'))
    except json.decoder.JSONDecodeError:
        return b

    return json_body


def transform_request_body(body):
    if isinstance(body, dict):
        body['api_key'] = CMS_SKYGEAR_MASTER_KEY

    return json.dumps(body).encode('utf-8')


def log_request(request):
    print(
        request.method,
        request.data,
        request.headers,
    )


def log_response(resp):
    print(
        resp.status_code,
        resp.headers,
        resp.content,
    )
