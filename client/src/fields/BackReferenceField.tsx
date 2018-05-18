import classnames from 'classnames';
import * as React from 'react';
import { Record } from 'skygear';

import { BackReferenceFieldConfig } from '../cmsConfig';
import { ReferenceLink } from '../components/ReferenceLink';
import { join } from '../util';

import { BackReferenceSelect } from './BackReferenceSelect';
import { RequiredFieldProps } from './Field';

export type BackReferenceFieldProps = RequiredFieldProps<
  BackReferenceFieldConfig
>;

export class BackReferenceField extends React.PureComponent<
  BackReferenceFieldProps
> {
  public render() {
    const {
      context,
      config,
      className,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    const $transient = context.record.$transient;

    if (config.editable) {
      return (
        <BackReferenceSelect
          {...this.props}
          className={classnames(className, 'back-ref-select')}
        />
      );
    }

    const targetFieldName = config.name;
    const targetRecords = $transient[targetFieldName] as Record[];

    const items = targetRecords.map(r => {
      return (
        <ReferenceLink
          key={r._id}
          recordName={config.targetCmsRecord.name}
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
