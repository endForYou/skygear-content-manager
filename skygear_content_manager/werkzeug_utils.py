import skygear

from werkzeug.wrappers import ResponseStreamMixin


def prepare_file_response(filename, mimetype):
    headers = {'Content-disposition': 'attachment; filename=' + filename}
    return StreamableResponse(mimetype=mimetype, headers=headers)


class StreamableResponse(skygear.Response, ResponseStreamMixin):
    pass
