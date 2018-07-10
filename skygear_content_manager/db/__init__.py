from skygear.utils import db

from .migrations import migration_1
from .migrations import migration_2


# _cms_version table will keep the number of migrations run
def get_migrations():
    return [
        ##
        #  Initialize _cms_push_campaign and _cms_push_campaign_user
        ##
        migration_1,
        ##
        # Initialize _cms_imported_file
        ##
        migration_2,
    ]


def cms_db_init(config):
    with db.conn() as conn:
        trans = conn.begin()
        try:
            upsert_version_table(conn)
            for version in next_version(conn):
                run_migration(conn, version)
            trans.commit()
        except Exception:
            trans.rollback()
            raise


def upsert_version_table(conn):
    conn.execute("""
CREATE TABLE IF NOT EXISTS _cms_version (
    version_num text NOT NULL
);
INSERT INTO _cms_version(version_num)
SELECT '0'
WHERE NOT EXISTS (SELECT * FROM _cms_version);
    """)


def next_version(conn):
    current_version = get_current_version(conn)
    while current_version < len(get_migrations()):
        current_version = current_version + 1
        yield current_version


def get_current_version(conn):
    result = conn.execute('SELECT version_num FROM _cms_version;')
    for row in result:
        return int(row['version_num'])


def run_migration(conn, version):
    global migrations
    migration = get_migrations()[version - 1]
    migration(conn)

    conn.execute("UPDATE _cms_version SET version_num = ('%d')" % (version))
