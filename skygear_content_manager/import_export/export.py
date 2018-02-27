import csv
import skygear

from werkzeug.wrappers import ResponseStreamMixin


def render_records(records, export_config, stream):
    writer = csv.writer(stream)

    # header
    column_names = [f.label for f in export_config.fields]
    writer.writerow(column_names)

    # record data
    for record in records:
        data = []
        for column_name in column_names:
            data.append(record[column_name])

        writer.writerow(data)


def prepare_response(name):
    filename = name + '.csv'
    headers = {'Content-disposition': 'attachment; filename=' + filename}
    return StreamableResponse(mimetype='text/csv', headers=headers)


class StreamableResponse(skygear.Response, ResponseStreamMixin):
    pass
