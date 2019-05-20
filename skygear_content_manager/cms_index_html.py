# pylama:skip=1
INDEX_HTML_FORMAT = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <link rel="manifest" href="{CMS_STATIC_URL}manifest.json">
    <link rel="stylesheet" href="{CMS_STATIC_URL}css/bootstrap.min.css">
    <link rel="stylesheet" href="{CMS_STATIC_URL}static/css/main.css">
    <title>{CMS_SITE_TITLE}</title>
  </head>
  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
    <script type="text/javascript" src="{CMS_STATIC_URL}tinymce/tinymce.min.js"></script>
    <script type="text/javascript" src="{CMS_STATIC_URL}static/js/main.js"></script>
    <script type="text/javascript">
      skygearCMS.start({{
        skygearEndpoint: "{CMS_SKYGEAR_ENDPOINT}",
        skygearApiKey: "{CMS_SKYGEAR_API_KEY}",
        cmsConfigUrl: "{CMS_CONFIG_FILE_URL}",
        publicUrl: "{CMS_PUBLIC_URL}",
        staticUrl: "{CMS_STATIC_URL}",
        adminRole: "{CMS_USER_PERMITTED_ROLE}",
        style: {{
            primaryColor: "{CMS_THEME_PRIMARY_COLOR}",
            sidebarColor: "{CMS_THEME_SIDEBAR_COLOR}",
            logoPath: "{CMS_THEME_LOGO}",
        }},
        largeCsv: {{
            fileSize: {CMS_LARGE_CSV_FILE_SIZE},
            importBatchSize: {CMS_LARGE_CSV_IMPORT_BATCH_SIZE},
        }},
      }});
    </script>
  </body>
</html>
"""
