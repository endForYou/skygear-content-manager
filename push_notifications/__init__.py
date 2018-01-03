import skygear
from skygear.utils import db
from . import lambdas


@skygear.event("before-plugins-ready")
def cms_push_notification_db_init(config):
    with db.conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS _cms_push_campaign (
                id text NOT NULL,
                device text NOT NULL,
                content text NOT NULL,
                send_time timestamp NOT NULL,
                user_id text NOT NULL,
                PRIMARY KEY (id)
            );
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS _cms_version (
                version_num text NOT NULL
            );
        """)
