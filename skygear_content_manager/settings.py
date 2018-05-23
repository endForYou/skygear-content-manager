import os


CMS_USER_PERMITTED_ROLE = os.environ.get('CMS_USER_PERMITTED_ROLE', 'Admin')
CMS_AUTH_SECRET = os.environ.get('CMS_AUTH_SECRET', 'FAKE_AUTH_SECRET')

# cms index params

CMS_SKYGEAR_ENDPOINT = \
    os.environ.get('CMS_SKYGEAR_ENDPOINT', 'http://localhost:3000/')
CMS_SKYGEAR_API_KEY = \
    os.environ.get('CMS_SKYGEAR_API_KEY', 'FAKE_API_KEY')
CMS_PUBLIC_URL = \
    os.environ.get('CMS_PUBLIC_URL', 'http://localhost:3000/cms')
CMS_STATIC_URL = \
    os.environ.get('CMS_STATIC_URL', 'http://localhost:3001/static/')
CMS_SITE_TITLE = \
    os.environ.get('CMS_SITE_TITLE', 'Skygear CMS')
CMS_CONFIG_FILE_URL = \
    os.environ.get('CMS_CONFIG_FILE_URL',
                   'http://localhost:3002/cms-config.yaml')

# cms theme params

CMS_THEME_PRIMARY_COLOR = os.environ.get('CMS_THEME_PRIMARY_COLOR', '#0275D8')
CMS_THEME_SIDEBAR_COLOR = os.environ.get('CMS_THEME_SIDEBAR_COLOR', '#19c2bf')
