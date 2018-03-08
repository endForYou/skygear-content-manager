from contextlib import contextmanager
from skygear.utils.db import _get_engine
from sqlalchemy.orm import sessionmaker

Session = sessionmaker()


@contextmanager
def scoped_session(session=None):
    if session is None:
        session = _create_session()
    try:
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()


def _create_session(isolation_level=None):
    Session.configure(bind=_get_engine())
    if isolation_level is not None:
        return Session(
            bind=_get_engine().execution_options(
                isolation_level=isolation_level
            )
        )
    else:
        return Session()
