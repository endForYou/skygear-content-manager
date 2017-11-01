import os

import requests
import skygear


CMS_SKYGEAR_ENDPOINT = \
    os.environ.get('CMS_SKYGEAR_ENDPOINT', 'http://localhost:3000/')

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
        data=request.data,
        headers=request.headers,
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
