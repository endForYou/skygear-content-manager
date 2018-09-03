import classnames from 'classnames';
import * as React from 'react';
import { Record } from 'skygear';

import { AssociationReferenceListFieldConfig } from '../cmsConfig';
import { ReferenceLink } from '../components/ReferenceLink';
import { join } from '../util';

import { RequiredFieldProps } from './Field';

export type AssociationReferenceListFieldProps = RequiredFieldProps<
  AssociationReferenceListFieldConfig
>;

export class AssociationReferenceListField extends React.PureComponent<
  AssociationReferenceListFieldProps
> {
  public render() {
    const {
      context,
      config,
      onFieldChange: _onFieldChange,
      value: _value,
      validationError: _validationError,
      ...rest,
    } = this.props;

    const $transient = context.record.$transient;

    const targetFieldName = config.name;
    const targetRecords = $transient[targetFieldName] as Record[];

    const items = targetRecords.map(r => {
      return (
        <ReferenceLink
          key={r._id}
          recordName={
            config.reference.targetReference.reference.targetCmsRecord.name
          }
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
