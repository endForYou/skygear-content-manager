import copy


def generate_config(schema):
    return {
        'site': generate_site_config(schema),
        'records': generate_records_config(schema)
    }


def generate_site_config(schema):
    non_record_pages = [{
        'type': 'user_management',
    }]

    if has_asset_field(schema):
        non_record_pages = non_record_pages + [{
            'type': 'file_import',
        }]

    record_pages = [{
        'type': 'record',
        'name': r,
    } for r in schema.record_types]

    return non_record_pages + [{'type': 'space'}] + record_pages


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
    field_configs = []
    for field in record.fields:
        field_config = generate_field_config(record, field)
        if field_config is not None:
            field_configs.append(field_config)

    reserved_field_configs = [{
        'name': '_id',
    }, {
        'name': '_created_at',
    }, {
        'name': '_updated_at',
    }]
    return {'fields': reserved_field_configs + field_configs}


def generate_field_config(record, field):
    field_config = {
        'name': field.name,
    }

    if field.is_ref:
        field_config['type'] = 'reference'
        field_config['reference_target'] = field.ref_target
        field_config['reference_field_name'] = '_id'
    elif field.type == 'string':
        field_config['type'] = 'string'
    elif field.type in 'number':
        field_config['type'] = 'number'
    elif field.type == 'boolean':
        field_config['type'] = 'boolean'
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
        field_config['type'] = 'date_time'
        field_config['date_picker'] = field.date_picker
        field_config['time_picker'] = field.time_picker
        field_config['date_time_format'] = field.date_time_format
    elif field.type == 'integer':
        field_config['type'] = 'integer'
    elif field.type == 'asset':
        field_config['type'] = 'asset'
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
