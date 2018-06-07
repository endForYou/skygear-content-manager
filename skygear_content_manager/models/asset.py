from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Text, BigInteger

Base = declarative_base()


class Asset(Base):
    __tablename__ = '_asset'
    id = Column(Text, primary_key=True, nullable=False)
    content_type = Column(Text, nullable=False)
    size = Column(BigInteger, nullable=False)
