from skygear.action import push_users
from skygear.container import SkygearContainer


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

        push_users(self.container, user_ids, notification)
