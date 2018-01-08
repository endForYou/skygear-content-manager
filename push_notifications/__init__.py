import skygear
from skygear.utils import db
from . import lambdas


@skygear.event("before-plugins-ready")
def cms_push_notification_db_init(config):
    with db.conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS _cms_push_campaign (
                id text NOT NULL,
                content text NOT NULL,
                send_time timestamp NOT NULL,
                type text NOT NULL,
                sent boolean NOT NULL,
                number_of_audiences integer NOT NULL,
                PRIMARY KEY (id)
            );
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS _cms_push_campaign_user (
                id text NOT NULL,
                push_campaign_id text NOT NULL REFERENCES _cms_push_campaign(id),
                user_id text NOT NULL,
                PRIMARY KEY (id)
            );
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS _cms_version (
                version_num text NOT NULL
            );
        """)
