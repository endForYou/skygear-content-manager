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


def create_date(date):
    return { '$type': 'date', '$date': date }


def create_ref(rtype, rid=None):
    full_id = rtype + '/' + rid if rid != None else rtype
    return { '$type': 'ref', '$id': full_id }


def create_users():
    user_datas = [{
        'username': 'customer1',
        'password': 'secret',
        'profile': {
            'contact_name': 'Mr. Chan',
            'phone': '23456789',
            'email': 'chan@skygear.io',
            'address': 'Hong Kong Island',
        },
    }, {
        'username': 'customer2',
        'password': 'secret',
        'profile': {
            'contact_name': 'Kenji Pa',
            'phone': '98765432',
            'email': 'pa@skygear.io',
            'address': 'Mars',
        },
    }]

    users = []
    for user_data in user_datas:
        user, _ = get_user_and_access_token(user_data)
        users.append(user)

    return users


def create_sample_records(users):
    return [{
        '_id': 'payment_method/payment_method_customer_1_1',
        'customer': create_ref(users[0]['_id']),
        'payment_priority': 0,
        'type': 'credit_card',
        'account_id': 'credit_card_1',
        'data': { 'last4': '5555', 'expiry': '04/23' },
        'active': True,
    }, {
        '_id': 'payment_method/payment_method_customer_1_2',
        'customer': create_ref(users[0]['_id']),
        'payment_priority': 1,
        'type': 'credit_card',
        'account_id': 'credit_card_2',
        'data': { 'last4': '8964', 'expiry': '01/22' },
        'active': True,
    }, {
        '_id': 'payment/payment_1',
        'customer': create_ref(users[0]['_id']),
        'payment_method': create_ref('payment_method', 'payment_method_customer_1_1'),
        'amount': 80
    }, {
        '_id': 'payment/payment_2',
        'customer': create_ref(users[0]['_id']),
        'payment_method': create_ref('payment_method', 'payment_method_customer_1_1'),
        'amount': 20
    }, {
        '_id': 'payment/payment_3',
        'customer': create_ref(users[0]['_id']),
        'payment_method': create_ref('payment_method', 'payment_method_customer_1_1'),
        'amount': 0.5,
    }, {
        '_id': 'product/product_1',
        'name': 'SkyBook',
        'description': 'SkyBook',
        # this is to create the asset field
        'picture': { '$type': 'asset', '$name': 'abc' },
        'active': True
    }, {
        '_id': 'product/product_2',
        'name': 'SkyBook Pro',
        'description': 'SkyBook Pro',
        'active': True
    }, {
        '_id': 'product/product_3',
        'name': 'The SkyBook',
        'description': 'The SkyBook',
        'active': False
    }, {
        '_id': 'order/order_1',
        'customer': create_ref(users[0]['_id']),
        'due_date': create_date('2014-09-27T17:40:00.000Z'),
        'status': 'pending',
        'comment': 'Weekday shipping',
    }, {
        '_id': 'order/order_2',
        'customer': create_ref(users[0]['_id']),
        'due_date': create_date('2014-09-27T17:40:00.000Z'),
        'status': 'shipping',
        'comment': 'Weekday shipping',
    }, {
        '_id': 'order/order_3',
        'customer': create_ref(users[0]['_id']),
        'due_date': create_date('2013-09-27T17:40:00.000Z'),
        'status': 'shipped',
        'comment': None,
    }, {
        '_id': 'order_product/order_product_1_1',
        'order': create_ref('order', 'order_1'),
        'product': create_ref('product', 'product_1'),
    }, {
        '_id': 'order_product/order_product_1_2',
        'order': create_ref('order', 'order_1'),
        'product': create_ref('product', 'product_2'),
    }, {
        '_id': 'order_product/order_product_2_1',
        'order': create_ref('order', 'order_2'),
        'product': create_ref('product', 'product_1'),
    }, {
        '_id': 'order_product/order_product_3_1',
        'order': create_ref('order', 'order_3'),
        'product': create_ref('product', 'product_3'),
    }]


def main():
    print('Get access token...')
    _, access_token = get_user_and_access_token({
        'username': context['username'],
        'password': context['password'],
        'profile': {
            'contact_name': context['username']
        },
    }, is_admin=True)

    print('Save sample data...')
    users = create_users()
    for record in create_sample_records(users):
        # just create one by one to bypass save non-existing reference record
        data = send_action('record:save', {
            'database_id': '_public',
            'records': [record],
        }, access_token)
        pprint.pprint(data)


def get_user_and_access_token(user, is_admin=False):
    data = send_action('auth:signup', {
        'auth_data': {
            'username': user['username'],
        },
        'profile': user['profile'],
        'password': user['password'],
    })

    if 'error' in data and data['error']['code'] == 109:
        data = send_action('auth:login', {
            'auth_data': {
                'username': user['username'],
            },
            'password': user['password'],
        })
        user = data['result']['profile']
        access_token = data['result']['access_token']
    elif 'error' not in data:
        user = data['result']['profile']
        access_token = data['result']['access_token']

        if is_admin:
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
