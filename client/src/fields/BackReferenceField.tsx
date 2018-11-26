import classnames from 'classnames';
import * as React from 'react';
import { Record } from 'skygear';

import { BackReferenceListFieldConfig } from '../cmsConfig';
import { ReferenceLink } from '../components/ReferenceLink';
import { join } from '../util';

import { RequiredFieldProps } from './Field';

export type BackReferenceListFieldProps = RequiredFieldProps<
  BackReferenceListFieldConfig
>;

export class BackReferenceListField extends React.PureComponent<
  BackReferenceListFieldProps
> {
  public render() {
    const {
      context,
      config,
      className,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest
    } = this.props;

    const $transient = context.record.$transient;

    const targetFieldName = config.name;
    const targetRecords = $transient[targetFieldName] as Record[];

    const items = targetRecords.map(r => {
      return (
        <ReferenceLink
          key={r._id}
          recordName={config.reference.targetCmsRecord.name}
          recordId={r._id}
        >
          {r[config.displayFieldName]}
        </ReferenceLink>
      );
    });

    if (config.compact) {
      return <span {...rest}>{join(items, ', ')}</span>;
    } else {
      const listItems = items.map((item, i) => (
        <li key={i} className="back-ref-list-item">
          {item}
        </li>
      ));
      return (
        <ul {...rest} className={classnames(className, 'back-ref-list')}>
          {listItems}
        </ul>
      );
    }
  }
}
