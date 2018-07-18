from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Text
from sqlalchemy.orm import relationship

from .meta import Base
from .role import Role  # noqa


class Auth(Base):
    __tablename__ = '_auth'
    id = Column(Text, ForeignKey('user._id'), primary_key=True, nullable=False)
    disabled = Column(Boolean, nullable=False, default=False)
    disabled_message = Column(Text)
    disabled_expiry = Column(DateTime)

    user = relationship('User', uselist=False, primaryjoin='User.id==Auth.id')
    roles = relationship('Role', secondary='_auth_role')


class User(Base):
    __tablename__ = 'user'
    id = Column('_id', Text, primary_key=True, nullable=False)


class AuthRole(Base):
    __tablename__ = '_auth_role'
    auth_id = Column(Text, ForeignKey('_auth.id'), primary_key=True)
    role_id = Column(Text, ForeignKey('_role.id'), primary_key=True)
