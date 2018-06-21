import copy


def generate_config(schema):
    return {
        'site': generate_site_config(schema),
        'records': generate_records_config(schema)
    }


def generate_site_config(schema):
    non_record_pages = [{
       'type': 'UserManagement',
    }]

    if has_asset_field(schema):
        non_record_pages = non_record_pages + [{
            'type': 'FileImport',
        }]

    record_pages = [{
        'type': 'Record',
        'name': r,
    } for r in schema.record_types]

    return non_record_pages + [{'type': 'Space'}] + record_pages


def generate_records_config(schema):
    return {
        r: generate_record_config(schema.record_types[r])
        for r in schema.record_types
    }


def generate_record_config(record):
    fields_config = generate_fields_config(record)
    return {
        # deep copy the config to avoid references in generated yaml
        'list': copy.deepcopy(fields_config),
        'show': copy.deepcopy(fields_config),
        'edit': copy.deepcopy(fields_config),
        'new': copy.deepcopy(fields_config),
    }


def generate_fields_config(record):
    fields = record.fields
    field_configs = [generate_field_config(record, field) for field in fields]
    reserved_field_configs = [{
        'name': '_id',
    }, {
        'name': '_created_at',
    }, {
        'name': '_updated_at',
    }]
    return {
        'fields': reserved_field_configs + field_configs
    }


def generate_field_config(record, field):
    field_config = {
        'name': field.name,
    }

    if field.is_ref:
        field_config['type'] = 'Reference'
        field_config['reference_target'] = field.ref_target
        field_config['reference_field_name'] = '_id'
    elif field.type == 'string':
        field_config['type'] = 'String'
    elif field.type in 'number':
        field_config['type'] = 'Number'
    elif field.type == 'boolean':
        field_config['type'] = 'Boolean'
    elif field.type == 'json':
        # TODO:
        # Need JSON support
        # field_config['type'] = 'JSON'
        return None
    elif field.type == 'location':
        # TODO:
        # Need JSON support
        # field_config['type'] = 'Location'
        return None
    elif field.type == 'datetime':
        field_config['type'] = 'DateTime'
    elif field.type == 'integer':
        field_config['type'] = 'Integer'
    elif field.type == 'asset':
        field_config['type'] = 'FileAsset'
    else:
        # skip for other field types
        return None

    return field_config


def has_asset_field(schema):
    for record_type in schema.record_types:
        record = schema.record_types[record_type]
        for field in record.fields:
            if field.type == 'asset':
                return True

    return False
