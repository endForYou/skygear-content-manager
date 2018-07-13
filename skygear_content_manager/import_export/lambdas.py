import json
import tempfile
from urllib.parse import parse_qs

import skygear

from ..config_loader import ConfigLoader
from ..record_utils import transient_foreign_records
from ..skygear_utils import AuthData
from ..skygear_utils import SkygearResponse
from ..skygear_utils import fetch_records
from .csv_serializer import RecordSerializer
from .export_csv import prepare_response as prepare_export_response
from .export_csv import render_data
from .export_csv import render_header
from .import_csv import import_records
from .import_csv import prepare_import_records


def register_lambdas(settings):
    register_export_lambdas(settings)
    register_import_lambdas(settings)


def register_export_lambdas(settings):
    @skygear.handler('cms-api/export')
    def export(request):
        data = parse_qs(request.query_string.decode())
        name = data.get('export_name', [None])[0]
        key = data.get('key', [None])[0]
        predicate_string = data.get('predicate', [None])[0]

        if not key:
            return SkygearResponse.access_token_not_accepted().to_werkzeug()

        authdata = AuthData.from_cms_token(key)
        if not authdata:
            return SkygearResponse.access_token_not_accepted().to_werkzeug()

        cms_config = ConfigLoader.get_instance().get_config()
        export_config = cms_config.get_export_config(name)
        if not export_config:
            return skygear.Response('Export config not found', 404)

        record_type = export_config.record_type
        includes = export_config.get_direct_reference_fields()

        predicate = None
        if predicate_string:
            try:
                predicate = json.loads(predicate_string)
            except Exception:
                return skygear.Response('Invalid predicate', 400)

        records = fetch_records(
            record_type, includes=includes, predicate=predicate)

        csv_datas = []
        for record in records:
            transient_foreign_records(record, export_config,
                                      cms_config.association_records)
            csv_data = record_to_csv_data(record, export_config.fields)
            csv_datas.append(csv_data)

        serializer = RecordSerializer(export_config.fields)
        serializer.walk_through(csv_datas)
        serialized_data = [serializer.serialize(d) for d in csv_datas]

        response = prepare_export_response(name)
        render_header(response.stream, export_config, serializer)
        render_data(response.stream, serialized_data)
        return response


def register_import_lambdas(settings):
    @skygear.handler('cms-api/import')
    def import_data(request):
        files = request.files
        form = request.form
        key = form.get('key')
        options = json.loads(form.get('options', '{}'))

        atomic = options.get('atomic', False)

        if not key:
            return SkygearResponse.access_token_not_accepted().to_werkzeug()

        authdata = AuthData.from_cms_token(key)
        if not authdata:
            return SkygearResponse.access_token_not_accepted().to_werkzeug()

        if 'file' not in files:
            return skygear.Response('Missing file', 400)

        file = files['file']
        name = form.get('import_name')

        cms_config = ConfigLoader.get_instance().get_config()
        import_config = cms_config.get_import_config(name)

        if not import_config:
            return skygear.Response('Import config not found', 404)

        temp_file = tempfile.NamedTemporaryFile(suffix='.csv')
        file.save(temp_file.name)

        records = None
        with open(temp_file.name, 'r', encoding='utf-8') as fp:
            # skip first row
            next(fp)
            records = prepare_import_records(fp, import_config, atomic)

        resp = import_records(records, atomic)
        return resp


def record_to_csv_data(record, fields):
    """
    From dictionary to array based on field config
    """
    data = []
    for field in fields:
        if field.reference:
            if field.reference.is_many:
                ref_record = record['_transient'].get(field.name, []) or []
                ref_data = [
                    record_to_csv_data(r, field.reference.target_fields)
                    for r in ref_record
                ]
            else:
                ref_record = record['_transient'].get(field.name, {}) or {}
                ref_data = record_to_csv_data(ref_record,
                                              field.reference.target_fields)

            data.append(ref_data)
        elif field.name == '_created_at' or field.name == '_updated_at':
            date_data = {
                '$type': 'date',
                '$date': record.get(field.name),
            }
            data.append(date_data)
        else:
            data.append(record.get(field.name))

    return data
