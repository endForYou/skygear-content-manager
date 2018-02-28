import json
import requests
import skygear

from jose import JWTError, jwt
from skygear.options import options

from .settings import CMS_AUTH_SECRET


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


def get_schema():
    resp = request_skygear_api('schema:fetch')
    return resp.body.data['result']


def save_records(records, database_id = '_public'):
    resp = request_skygear_api('record:save', data={
        'database_id': database_id,
        'records': records
    })
    return resp.body.data['result']


def fetch_records(record_type, predicate = None, includes = []):
    resp = request_skygear_api('record:query', data={
        'record_type': record_type,
        'database_id': '_union',
        'include': {i: {'$type': 'keypath', '$val': i} for i in includes},
        'predicate': predicate,
    })
    return resp.body.data['result']


def or_predicate(predicates):
    p = ['or']
    for predicate in predicates:
        p.append(predicate)

    return p


def eq_predicate(key, value):
    return ['eq', {'$type': 'keypath', '$val': key}, value]
