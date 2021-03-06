from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import Text

from .meta import Base


class CmsPushCampaign(Base):
    __tablename__ = '_cms_push_campaign'
    id = Column(Text, primary_key=True, nullable=False)
    content = Column(Text)
    send_time = Column(DateTime)
    type = Column(Text)
    sent = Column(Boolean)
    number_of_audiences = Column(Integer)

    def __init__(self, new_push_campaign):
        self.id = str(uuid4())
        self.content = new_push_campaign['content']
        # TODO: Implement scheduled push campaign
        self.send_time = datetime.utcnow()
        self.sent = True
        self.type = new_push_campaign['type']
        self.number_of_audiences = new_push_campaign['numberOfAudiences']


class CmsPushCampaignUser(Base):
    __tablename__ = '_cms_push_campaign_user'
    id = Column(Text, primary_key=True, nullable=False)
    push_campaign_id = Column(Text)
    user_id = Column(Text)

    def __init__(self, push_campaign_id, user_id):
        self.id = str(uuid4())
        self.push_campaign_id = push_campaign_id
        self.user_id = user_id
