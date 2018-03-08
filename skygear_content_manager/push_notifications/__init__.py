import skygear
from skygear.utils import db

from .lambdas import *

DB_VERSION = '1'


def cms_push_notification_db_init(config):
    with db.conn() as conn:

        # DB_VERSION == '1'
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
            CREATE TABLE IF NOT EXISTS _cms_push_campaign_user (
                id text NOT NULL,
                push_campaign_id text NOT NULL REFERENCES _cms_push_campaign(id),
                user_id text NOT NULL REFERENCES "user"(_id),
                PRIMARY KEY (id)
            );
            CREATE TABLE IF NOT EXISTS _cms_version (
                version_num text NOT NULL
            );
        """)

        conn.execute("""
            TRUNCATE _cms_version;
        """)

        conn.execute("""
            INSERT INTO _cms_version(version_num)
            VALUES
            (%s);
        """ % (DB_VERSION))
