from skygear.action import push_users
from skygear.container import SkygearContainer


class PushException(Exception):
    def __init__(self, push_error):
        super(PushException, self).__init__(push_error['message'])


class PushNotificationHelper():
    def __init__(self):
        self.container = SkygearContainer()

    def push_to_users(self, user_ids, title, body):
        notification = {
            'apns': {
                'aps': {
                    'alert': {
                        'title': title,
                        'body': body,
                    }
                },
                'from': 'skygear',
                'operation': 'notification',
            },
            'gcm': {
                'notification': {
                    'title': title,
                    'body': body,
                }
            },
        }

        result = push_users(self.container, user_ids, notification)
        if 'error' in result:
            raise PushException(result['error'])
