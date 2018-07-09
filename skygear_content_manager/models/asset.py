from sqlalchemy import BigInteger
from sqlalchemy import Column
from sqlalchemy import Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Asset(Base):
    __tablename__ = '_asset'
    id = Column(Text, primary_key=True, nullable=False)
    content_type = Column(Text, nullable=False)
    size = Column(BigInteger, nullable=False)
