import * as React from 'react';
import { Record } from 'skygear';

import { FieldConfig, FieldConfigTypes } from '../../cmsConfig';
// import { FieldConfig } from '../cmsConfig';
import { Effect } from '../../components/RecordFormPage';

// import { AssociationReferenceFilterField } from './AssociationReferenceFilterField';
import { ReferenceFilterField } from './ReferenceFilterField';

export type FieldProps = ChildProps<FieldConfig>;

// props that child component must possess
export type RequiredFieldProps<C extends FieldConfig> = ChildProps<C>;

// props that pass through from Field to concerte field implementation
export interface ChildProps<C extends FieldConfig> {
  config: C;

  // HTML related attrs
  name?: string;
  className?: string;

  onFieldChange?: FieldChangeHandler;

  // tslint:disable-next-line: no-any
  value: any;
}

// tslint:disable-next-line: no-any
export type FieldChangeHandler = (value: any, effect?: Effect) => void;

export interface FieldContext {
  record: Record;
}

export function FieldContext(record: Record): FieldContext {
  return {
    record,
  };
}

export class FilterField extends React.PureComponent<FieldProps> {
  public render() {
    const { config, ...rest } = this.props;
    // return <ReferenceFilterField {...rest} config={config} />;
    switch (config.type) {
      case FieldConfigTypes.Reference:
        return <ReferenceFilterField {...rest} config={config} />;
      default:
        return null;
      // case FieldConfigTypes.AssociationReference:
      //   return <AssociationReferenceFilterField {...rest} config={config} />;
    }
  }
}
