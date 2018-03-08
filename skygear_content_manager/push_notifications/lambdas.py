import skygear
from skygear.utils import db
from marshmallow import Schema, fields
from skygear.utils.context import current_context
from skygear.error import SkygearException

from .db_session import scoped_session
from .helper import PushNotificationHelper
from ..models.push_campaign import CmsPushCampaign, CmsPushCampaignUser

PAGE_SIZE = 25
PAGE = 1


class CmsPushCampaignSchema(Schema):
    id = fields.String()
    content = fields.String()
    send_time = fields.DateTime(format="%Y-%m-%d %H:%M:%S")
    type = fields.String()
    sent = fields.Boolean()
    number_of_audiences = fields.Integer()


class NewPushCampaignSchema(Schema):
    type = fields.String(required=True, allow_none=False)
    numberOfAudiences = fields.Integer(required=True, allow_none=False)
    title = fields.String()
    content = fields.String(required=True, allow_none=False)
    userIds = fields.List(fields.String)


def register_lambda(settings):
    @skygear.op("push_campaign:get_all", user_required=True)
    def get_all_push_campaigns(**kwargs):
        _validate_master_user()
        page_size = kwargs.get('perPage', PAGE_SIZE)
        page = kwargs.get('page', PAGE)
        with db.conn() as conn:
            total_count = conn.execute('SELECT COUNT(id) FROM _cms_push_campaign').scalar()
            query_result = conn.execute('''
                SELECT * FROM _cms_push_campaign
                ORDER BY send_time DESC
                LIMIT %d
                OFFSET %d
            ''' % (page_size, page_size * (page - 1)))
            push_campaigns_dict_list = CmsPushCampaignSchema(
                many=True).dump(query_result).data
        return {'pushCampaigns': push_campaigns_dict_list, 'totalCount': total_count}


    @skygear.op("push_campaign:create_new", user_required=True)
    def create_push_notification(**kwargs):
        _validate_master_user()
        new_push_campaign = kwargs['new_push_campaign']
        new_push_campaign, errors = NewPushCampaignSchema().load(new_push_campaign)
        if len(errors) > 0:
            return {'errors': errors}
        user_ids = new_push_campaign['userIds']
        message_content = new_push_campaign['content']
        message_title = new_push_campaign.get('title', '')
        PushNotificationHelper().push_to_users(user_ids, message_title, message_content)
        _create_cms_push_campaign(new_push_campaign)
        return {'result': 'ok'}


def _create_cms_push_campaign(new_push_campaign):
    with scoped_session() as session:
        new_cms_push_campaign = CmsPushCampaign(new_push_campaign)
        session.add(new_cms_push_campaign)
        session.flush()
        _create_cms_push_campaign_user(session, new_cms_push_campaign.id, new_push_campaign['userIds'])


def _create_cms_push_campaign_user(session, cms_push_campaign_id, user_ids):
    for user_id in user_ids:
        new_cms_push_campaign_user = CmsPushCampaignUser(cms_push_campaign_id, user_id)
        session.add(new_cms_push_campaign_user)


def _validate_master_user():
    if current_context().get('access_key_type') != 'master':
        raise SkygearException('Permission denied')
