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


@skygear.handler('cms/api/')
def api(request):
    # log_request(request)

    req = SkygearRequest.from_werkzeug(request)

    if req.body.is_json and req.body.data.get('action') == 'auth:login':
        return intercept_login(req).to_werkzeug()

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
        if self.body.is_json:
            access_token = self.body.data.get('access_token')
            if access_token:
                return access_token

        return self.headers.get('X-Skygear-Access-Token')

    @access_token.setter
    def access_token(self, access_token):
        if self.body.is_json:
            self.body.data['access_token'] = access_token

        self.headers['X-Skygear-Access-Token'] = access_token

    def to_requests(self):
        method = self.method
        # TODO: should clone body here
        body = self.body
        headers = self.headers.copy()

        if self.is_master:
            if body.is_json:
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
        if self.body.is_json:
            access_token = self.body.data.get('result', {}).get('access_token')
            if access_token:
                return access_token

        return self.headers.get('X-Skygear-Access-Token')

    @access_token.setter
    def access_token(self, access_token):
        if self.body.is_json:
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
            if k not in HEADER_BLACKLIST
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
        jwt.encode({
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
    if not resp.body.is_json:
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
