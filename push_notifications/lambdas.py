import skygear
from skygear.utils import db
from marshmallow import Schema, fields


PAGE_SIZE = 25
PAGE = 1


class CmsPushCampaignSchema(Schema):
    id = fields.String()
    content = fields.String()
    send_time = fields.DateTime()
    type = fields.String()
    sent = fields.Boolean()
    number_of_audiences = fields.Integer()


@skygear.op("push_campaign:get_all", user_required=True)
def get_all_push_campaigns(**kwargs):
    page_size = kwargs.get('perPage', PAGE_SIZE)
    page = kwargs.get('page', PAGE)
    with db.conn() as conn:
        total_count = conn.execute('SELECT COUNT(id) FROM _cms_push_campaign').scalar()
        query_result = conn.execute('''
            SELECT * FROM _cms_push_campaign
            LIMIT %d
            OFFSET %d
        ''' % (page_size, page_size * (page - 1)))
        push_campaigns_dict_list = CmsPushCampaignSchema(
            many=True).dump(query_result).data
    return {'pushCampaigns': push_campaigns_dict_list, 'totalCount': total_count}
