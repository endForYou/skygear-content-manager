from sqlalchemy import not_

from .models.cms_config import CMSRecordAssociationReference
from .models.cms_config import CMSRecordBackReference
from .skygear_utils import eq_predicate
from .skygear_utils import fetch_records
from .skygear_utils import or_predicate


def get_order_by(col_map, name, is_ascending):
    col = col_map.get(name)
    if not col:
        raise Exception('Unexpected field name: {}'.format(name))

    return col.asc() if is_ascending else col.desc()


def get_filter_func(col_map, name, query, value):
    col = col_map.get(name)
    if not col:
        raise Exception('Unexpected field name: {}'.format(name))

    if query == 'equal_to':
        return col == value
    elif query == 'not_equal_to':
        return col != value
    elif query == 'contain':
        return col.ilike('%' + value + '%')
    elif query == 'not_contain':
        return not_(col.ilike('%' + value + '%'))
    elif query == 'before' or query == 'less_than':
        return col < value
    elif query == 'after' or query == 'greater_than':
        return col > value
    elif query == 'less_than_or_equal_to':
        return col <= value
    elif query == 'greater_than_or_equal_to':
        return col >= value
    else:
        raise Exception('Unexpected query type: {}', format(query))


def apply_filters(query, filters, col_map):
    for filter in filters:
        query = query.filter(
            get_filter_func(col_map, filter['name'], filter['query'],
                            filter['value']))

    return query


def fetch_records_by_values_in_key(record_type, key, values):
    if len(values) == 0:
        return []

    value_predicates = [eq_predicate(key, v) for v in values]
    predicate = or_predicate(value_predicates)
    return fetch_records(record_type, predicate)


def transient_foreign_records(record, export_config, association_records):
    """
    Fetch and embed foreign records, with one-to-many or many-to-many
    relationship, to _transient of the record.

    For example, each "user" record has many "skill", with config field
    name "user_has_skill". This function would fetch "skill" records that
    are referenced by the "user" record, and embed the "skill" record list in
    user['_transient']['user_has_skill'].
    """
    reference_fields = export_config.get_many_reference_fields()
    record_id = record['_id'].split('/')[1]

    for field in reference_fields:
        reference = field.reference
        records = None

        if isinstance(reference, CMSRecordAssociationReference):
            association_record = association_records[
                reference.association_record.name]

            foreign_field = \
                [f for f in association_record.fields
                 if f.target_cms_record.name == reference.target_reference][0]

            self_field = \
                [f for f in association_record.fields
                 if f.target_cms_record.name != reference.target_reference][0]

            predicate = eq_predicate(self_field.name, record_id)
            foreign_records = fetch_records(
                reference.association_record.record_type,
                predicate=predicate,
                includes=[foreign_field.name])
            records = \
                [r['_transient'][foreign_field.name] for r in foreign_records]
        elif isinstance(reference, CMSRecordBackReference):
            predicate = eq_predicate(reference.source_reference, record_id)
            records = fetch_records(
                reference.target_cms_record.record_type, predicate=predicate)
        else:
            # skip for direct reference
            continue

        if '_transient' not in record:
            record['_transient'] = {}

        record['_transient'][field.name] = records
