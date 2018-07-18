from sqlalchemy import Column
from sqlalchemy import Text

from .meta import Base


class Role(Base):
    __tablename__ = '_role'
    id = Column(Text, primary_key=True, nullable=False)
