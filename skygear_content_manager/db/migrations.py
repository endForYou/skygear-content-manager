def migration_1(conn):
    conn.execute("""
CREATE TABLE _cms_push_campaign (
    id text NOT NULL,
    content text NOT NULL,
    send_time timestamp NOT NULL,
    type text NOT NULL,
    sent boolean NOT NULL,
    number_of_audiences integer NOT NULL,
    PRIMARY KEY (id)
);
CREATE TABLE _cms_push_campaign_user (
    id text NOT NULL,
    push_campaign_id text NOT NULL REFERENCES _cms_push_campaign(id),
    user_id text NOT NULL REFERENCES "user"(_id),
    PRIMARY KEY (id)
);
    """)


def migration_2(conn):
    conn.execute("""
CREATE TABLE _cms_imported_file (
    id text NOT NULL,
    asset text NOT NULL REFERENCES _asset(id),
    uploaded_at timestamp NOT NULL,
    PRIMARY KEY (id)
);
    """)
