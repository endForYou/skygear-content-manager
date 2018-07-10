from .models.cms_config import CMSRecordAssociationReference
from .models.cms_config import CMSRecordBackReference
from .skygear_utils import eq_predicate
from .skygear_utils import fetch_records


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

        record['_transient'][field.name] = records
