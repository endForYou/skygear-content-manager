import http.client
import json
import os
import pprint


context = {
    'skygear_endpoint': os.environ.get('SKYGEAR_ENDPOINT', 'localhost:3001'),
    'api_key': os.environ.get('API_KEY', 'my_skygear_key'),
    'username': os.environ.get('USERNAME', 'admin'),
    'password': os.environ.get('PASSWORD', 'secret'),
}

conn = http.client.HTTPConnection(context['skygear_endpoint'])


def main():
    print('Get access token...')
    data = send_action('auth:signup', {
        'auth_data': {
            'username': context['username'],
        },
        'profile': {
            'displayName': context['username'],
        },
        'password': context['password'],
    })

    if data['error']['code'] == 109:
        data = send_action('auth:login', {
            'auth_data': {
                'username': context['username'],
            },
            'password': context['password'],
        })

    if 'error' in data:
        raise Exception(data['error']['message'])

    access_token = data['result']['access_token']
    user_id = data['result']['profile']['_id']

    print('Save sample data...')
    records = [{
        '_id': 'skill/1',
        'display_name': 'sss\"AAA\'111',
    }, {
        '_id': 'skill/2',
        'display_name': 'sss\"AAA\'222',
    }, {
        '_id': 'user_has_skill/a1',
        'user_id': {'$type': 'ref', '$id': user_id},
        'skill_id': {'$type': 'ref', '$id': 'skill/1'},
    }, {
        '_id': 'user_has_skill/a2',
        'user_id': {'$type': 'ref', '$id': user_id},
        'skill_id': {'$type': 'ref', '$id': 'skill/2'},
    }, {
        '_id': 'city/hk',
        'display_name': 'hk',
    }, {
        '_id': 'country/hk',
        'display_name': 'hk',
    }, {
        '_id': user_id,
        'city': {'$type': 'ref', '$id': 'city/hk'},
        'country': {'$type': 'ref', '$id': 'country/hk'},
        'name': context['username'],
        'email': context['username'] + '@oursky.com',
        'json': {'a': 'b'},
        'location': {'$type': 'geo', '$lat': 22, '$lng': 114},
    }]
    data = send_action('record:save', {
        'database_id': '_public',
        'records': records
    }, access_token)

    pprint.pprint(data)


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
