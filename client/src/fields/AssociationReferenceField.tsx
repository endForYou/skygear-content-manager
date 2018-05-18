import classnames from 'classnames';
import * as React from 'react';
import { Record } from 'skygear';

import { AssociationReferenceFieldConfig } from '../cmsConfig';
import { ReferenceLink } from '../components/ReferenceLink';
import { join } from '../util';

import { AssociationRecordSelect } from './AssociationRecordSelect';
import { RequiredFieldProps } from './Field';

export type AssociationReferenceFieldProps = RequiredFieldProps<
  AssociationReferenceFieldConfig
>;

export class AssociationReferenceField extends React.PureComponent<
  AssociationReferenceFieldProps
> {
  public render() {
    const {
      context,
      config,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    const $transient = context.record.$transient;

    if (config.editable) {
      return <AssociationRecordSelect {...this.props} />;
    }

    const targetFieldName = config.name;
    const targetRecords = $transient[targetFieldName] as Record[];

    const items = targetRecords.map(r => {
      return (
        <ReferenceLink
          key={r._id}
          recordName={config.targetReference.targetCmsRecord.name}
          recordId={r._id}
        >
          {r[config.displayFieldName]}
        </ReferenceLink>
      );
    });

    if (config.compact) {
      return <span {...rest}>{join(items, ', ')}</span>;
    } else {
      const { className: className, ...restWithoutClassName } = rest;
      const listItems = items.map((item, i) => (
        <li key={i} className="asso-ref-list-item">
          {item}
        </li>
      ));
      return (
        <ul
          {...restWithoutClassName}
          className={classnames(className, 'asso-ref-list')}
        >
          {listItems}
        </ul>
      );
    }
  }
}
