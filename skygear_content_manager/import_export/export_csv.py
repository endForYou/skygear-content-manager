import csv
import skygear

from werkzeug.wrappers import ResponseStreamMixin

from .csv_serializer import SpreadListSerializer
from ..models.cms_config import DISPLAY_MODE_GROUPED


def render_header(stream, export_config, record_serializer):
    writer = csv.writer(stream)
    field_serializers = record_serializer.serializers

    # header
    column_names = []
    for i in range(0, len(export_config.fields)):
        field = export_config.fields[i]
        if not field.reference or \
           field.reference.display_mode == DISPLAY_MODE_GROUPED:
            column_names.append(field.label)
            continue

        if not field.reference.is_many:
            column_names = column_names + [ref_field.label for ref_field in field.reference.target_fields]
            continue

        # handle many records with many fields
        serializer = field_serializers[i].value_serializer
        if not isinstance(serializer, SpreadListSerializer):
            raise Exception('Unexpected serializer for field {}'.format(field.name))

        for j in range(0, serializer.record_count):
            context = {
                'index': j,
            }
            column_names = column_names + [ref_field.label.format(**context) for ref_field in field.reference.target_fields]

    writer.writerow(column_names)


def render_data(stream, csv_datas):
    writer = csv.writer(stream)
    for data in csv_datas:
        writer.writerow(data)


def prepare_response(name):
    filename = name + '.csv'
    headers = {'Content-disposition': 'attachment; filename=' + filename}
    return StreamableResponse(mimetype='text/csv', headers=headers)


class StreamableResponse(skygear.Response, ResponseStreamMixin):
    pass
