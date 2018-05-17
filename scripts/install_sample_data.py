import http.client
import json
import os
import pprint


context = {
    'skygear_endpoint': os.environ.get('SKYGEAR_ENDPOINT', 'localhost:3001'),
    'api_key': os.environ.get('API_KEY', 'my_master_key'),
    'username': os.environ.get('USERNAME', 'admin'),
    'password': os.environ.get('PASSWORD', 'secret'),
}

conn = http.client.HTTPConnection(context['skygear_endpoint'])


def create_sample_records():
    return [{
        '_id': 'field_demo/sample_1',
    }, {
        '_id': 'ref_demo/sample_ref_1',
        'name': 'ref_name1',
    }, {
        '_id': 'back_ref_demo/sample_back_ref_1',
        'name': 'back_ref_name1',
        'reference': {'$type': 'ref', '$id': 'field_demo/sample_1' },
        'field_demo_position': 0,
    }, {
        '_id': 'field_demo/sample_1',
        'name': 'name',
        'textarea': 'text area',
        'dropdown': 'Option A',
        'wysiwyg': '',
        'datetime': { '$type': 'date', '$date': '2014-09-27T17:40:00.000Z' },
        'boolean': False,
        'integer': 100,
        'number': 100.1,
        'reference': None,
        'deleted': False,
    }, {
        '_id': 'field_demo/sample_2',
        'name': 'name2',
        'textarea': 'text area',
        'dropdown': 'Option A',
        'wysiwyg': '',
        'datetime': { '$type': 'date', '$date': '2015-09-27T17:40:00.000Z' },
        'boolean': True,
        'integer': 100,
        'number': 100.1,
        'reference': {'$type': 'ref', '$id': 'ref_demo/sample_ref_1' },
    }, {
        '_id': 'asso_ref_demo/sample_asso_ref_1',
        'name': 'asso_ref_name1',
    }, {
        '_id': 'field_asso_ref/1',
        'field_demo': {'$type': 'ref', '$id': 'field_demo/sample_1' },
        'asso_ref_demo': {'$type': 'ref', '$id': 'asso_ref_demo/sample_asso_ref_1' },
    }, {
        '_id': 'field_demo/sample_3',
        'name': 'name3',
        'deleted': True,
    }]


def main():
    print('Get access token...')
    _, access_token = get_user_and_access_token()

    print('Save sample data...')
    for record in create_sample_records():
        # just create one by one to bypass save non-existing reference record
        data = send_action('record:save', {
            'database_id': '_public',
            'records': [record],
        }, access_token)
        pprint.pprint(data)


def get_user_and_access_token():
    data = send_action('auth:signup', {
        'auth_data': {
            'username': context['username'],
        },
        'profile': {
            'displayName': context['username'],
        },
        'password': context['password'],
    })

    if 'error' in data and data['error']['code'] == 109:
        data = send_action('auth:login', {
            'auth_data': {
                'username': context['username'],
            },
            'password': context['password'],
        })
        user = data['result']['profile']
        access_token = data['result']['access_token']
    elif 'error' not in data:
        user = data['result']['profile']
        access_token = data['result']['access_token']
        data = send_action('role:assign', {
            'users': [data['result']['user_id']],
            'roles': ['Admin'],
        }, access_token)

    if 'error' in data:
        raise Exception(data['error']['message'])

    return user, access_token


def send_action(action, data, access_token=None):
    payload = {
        'action': action,
        'api_key': context['api_key'],
    }

    payload.update(data)

    if access_token:
        payload['access_token'] = access_token

    headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        }

    conn.request("POST", "/", json.dumps(payload), headers)

    res = conn.getresponse()
    return json.loads(res.read().decode('utf-8'))


main()
