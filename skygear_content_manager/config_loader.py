import random
import string
import urllib.parse as urlparse
from urllib.parse import urlencode

import requests
from ruamel.yaml import YAML

from .generate_config import generate_config
from .models.cms_config import CMSRecord
from .schema.cms_config import CMSAssociationRecordSchema
from .schema.cms_config import CMSConfigSchema
from .schema.skygear_schema import SkygearSchemaSchema
from .settings import CMS_CONFIG_FILE_URL
from .settings import CMS_SKYGEAR_ENDPOINT
from .skygear_utils import get_schema

cms_config_loader = None


class ConfigLoader:
    def __init__(self):
        self.config_source = None
        self.config_data = None
        self.schema = None
        self.config = None

    @classmethod
    def get_instance(cls):
        global cms_config_loader
        if cms_config_loader is None:
            cms_config_loader = ConfigLoader()
            cms_config_loader.set_config_source(CMS_CONFIG_FILE_URL)

        return cms_config_loader

    def set_config_source(self, config_source, add_random_string=True):
        if add_random_string and config_source:
            config_source = add_random_string_to_query_params(config_source)

        self.config_source = config_source
        self.config_data = None
        self.config = None

    def get_config_source(self):
        """
        This is for external use only.

        ConfigLoader should generate default config itself if it finds
        config_source is empty.
        """
        default_source = CMS_SKYGEAR_ENDPOINT + 'default-cms-config.yaml'
        return self.config_source or default_source

    def reset_schema(self):
        self.schema = None
        self.config = None

    def get_config(self):
        config_source = self.config_source
        if not config_source:
            return self._get_default_config()

        if self.config_data is None:
            self.config_data = self._download_config_data(self.config_source)

        if self.schema is None:
            self.schema = self._download_schema()

        if self.config is None:
            self.config = self._parse_config(self.schema, self.config_data)

        return self.config

    def _get_default_config(self):
        schema = self._download_schema()
        config_data = generate_config(schema)
        return self._parse_config(schema, config_data)

    def _download_config_data(self, file_path):
        r = requests.get(file_path)
        if not (200 <= r.status_code <= 299):
            raise Exception('Failed to get cms config yaml file')

        yaml = YAML()
        return yaml.load(r.text)

    def _download_schema(self):
        return SkygearSchemaSchema().load(get_schema())

    def _parse_config(self, schema, config_data):
        association_records_data = config_data['association_records'] \
                                   if 'association_records' in config_data \
                                   else {}
        cms_records_data = \
            config_data['records'] if 'records' in config_data else {}

        cms_records = {}
        for key, value in cms_records_data.items():
            record_type = value.get('record_type', key)
            cms_records[key] = CMSRecord(name=key, record_type=record_type)

        association_records = {}
        association_record_schema = CMSAssociationRecordSchema()
        for key, value in association_records_data.items():
            association_record_schema.context = {
                'name': key,
                'cms_records': cms_records,
            }
            association_records[key] = association_record_schema.load(value)

        config_schema = CMSConfigSchema()
        config_schema.context = {
            'schema': schema,
            'association_records': association_records,
            'cms_records': cms_records,
        }

        cms_config = config_schema.load(config_data)
        cms_config.association_records = association_records
        cms_config.cms_records = cms_records
        return cms_config


def add_random_string_to_query_params(url):
    random_str = ''.join(
        random.choices(string.ascii_lowercase + string.digits, k=6))

    url_parts = list(urlparse.urlparse(url))
    query = dict(urlparse.parse_qsl(url_parts[4]))
    query.update({'rand': random_str})
    url_parts[4] = urlencode(query)

    return urlparse.urlunparse(url_parts)
