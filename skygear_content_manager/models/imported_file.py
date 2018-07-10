from datetime import datetime

from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

from .asset import Asset

Base = declarative_base()


class CmsImportedFile(Base):
    __tablename__ = '_cms_imported_file'
    id = Column(Text, primary_key=True, nullable=False)
    asset_id = Column('asset', ForeignKey(Asset.id), nullable=False)
    uploaded_at = Column(DateTime, nullable=False, default=datetime.now)

    asset = relationship(Asset)

    def __init__(self, id, asset_id):
        self.id = id
        self.asset_id = asset_id

    @classmethod
    def from_dict(cls, dict):
        return CmsImportedFile(id=dict['id'], asset_id=dict['asset'])
