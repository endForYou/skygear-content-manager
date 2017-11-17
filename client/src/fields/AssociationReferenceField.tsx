import * as React from 'react';
import { Record } from 'skygear';

import { AssociationReferenceFieldConfig } from '../cmsConfig';
import { ReferenceLink } from '../components/ReferenceLink';
import { join } from '../util';

import { RequiredFieldProps } from './index';

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

    const targetFieldName = config.name;
    const targetRecords =
      (context.record.$transient[targetFieldName] as Record[]) || [];
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
      const { className: _className, ...restWithoutClassName } = rest;
      const listItems = items.map((item, i) => <li key={i}>{item}</li>);
      return <ul {...restWithoutClassName}>{listItems}</ul>;
    }
  }
}
