from marshmallow import fields


class NestedDict(fields.Nested):
    def __init__(self, nested, key, *args, **kwargs):
        super(NestedDict, self).__init__(nested, many=True, *args, **kwargs)
        self.key = key

    def _serialize(self, nested_obj, attr, obj):
        nested_list = super(NestedDict, self)._serialize(nested_obj, attr, obj)
        nested_dict = {item[self.key]: item for item in nested_list}
        return nested_dict

    def _deserialize(self, value, attr, data):
        raw_list = []
        for key, item in value.items():
            item[self.key] = key
            raw_list.append(item)
        nested_list = super(NestedDict, self)._deserialize(raw_list, attr, data)
        nested_dict = {getattr(item, self.key): item for item in nested_list}
        return nested_dict
