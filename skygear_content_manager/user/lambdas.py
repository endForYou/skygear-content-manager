import skygear
from marshmallow import Schema
from marshmallow import fields

from ..db_session import scoped_session
from ..models.user import Auth
from ..models.user import User
from ..record_utils import apply_filters
from ..record_utils import fetch_records_by_values_in_key
from ..skygear_utils import validate_master_user

PAGE_SIZE = 25
PAGE = 1

filter_name_to_col = {
    '_id': Auth.id,
    'email': User.email,
    'username': User.username,
}


class UserSchema(Schema):
    id = fields.String()
    roles = fields.Method('get_role')
    disabled = fields.Boolean(dump_only=True)
    disabled_message = fields.String(dump_only=True)
    disabled_expiry = fields.DateTime(
        format="%Y-%m-%dT%H:%M:%SZ", dump_only=True)

    def get_role(self, obj):
        return [role.id for role in obj.roles]

    def get_email(self, obj):
        return obj.user.email if obj.user else None

    def get_username(self, obj):
        return obj.user.username if obj.user else None


def register_lambdas(settings):
    @skygear.op('user:get_all')
    def get_all_user(**kwargs):
        validate_master_user()
        page_size = kwargs.get('perPage', PAGE_SIZE)
        page = kwargs.get('page', PAGE)
        filter = kwargs.get('filter', [])
        with scoped_session() as session:
            query = session.query(Auth).join(Auth.user)
            query = apply_filters(query, filter, filter_name_to_col)
            total_count = query.count()
            query = query.limit(page_size).offset(page_size * (page - 1))
            result = query.all()
            users = UserSchema(many=True).dump(result)
            inject_user_record(users)
            return {'users': users, 'totalCount': total_count}

    @skygear.op('user:get')
    def get_user(user_id):
        validate_master_user()
        with scoped_session() as session:
            result = session.query(Auth).filter(Auth.id == user_id).one()
            user = UserSchema().dump(result)
            inject_user_record([user])
            return {'user': user}


def inject_user_record(users):
    user_ids = [user['id'] for user in users]
    user_records = fetch_records_by_values_in_key('user', '_id', user_ids)
    user_record_map = {r['_id']: r for r in user_records}

    for user in users:
        user['record'] = user_record_map.get('user/' + user['id'])
