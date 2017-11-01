import json
import os

import requests
import skygear


CMS_SKYGEAR_ENDPOINT = \
    os.environ.get('CMS_SKYGEAR_ENDPOINT', 'http://localhost:3000/')
CMS_SKYGEAR_MASTER_KEY = \
    os.environ.get('CMS_SKYGEAR_MASTER_KEY', 'FAKE_MASTER_KEY')

HEADER_BLACKLIST = [
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Origin',
    'Server',
]


@skygear.handler('cms/api/')
def api(request):
    log_request(request)

    resp = requests.request(
        request.method,
        url=CMS_SKYGEAR_ENDPOINT,
        data=transform_request_data(request.data),
        headers=transform_request_header(request.headers),
    )

    log_response(resp)

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


def transform_request_data(data):
    if not data:
        return data

    try:
        json_body = json.loads(data.decode('utf-8'))
    except json.decoder.JSONDecodeError:
        return data

    if not isinstance(json_body, dict):
        return data

    json_body['api_key'] = CMS_SKYGEAR_MASTER_KEY

    return json.dumps(json_body).encode('utf-8')


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
