import * as React from 'react';

import { FilterConfig, FilterConfigTypes } from '../cmsConfig';

import { ReferenceFilterInput } from './ReferenceFilterInput';
import { StringFilterInput } from './StringFilterInput';

export type FilterFieldProps = ChildProps<FilterConfig>;

// props that child component must possess
export type RequiredFilterInputProps<C extends FilterConfig> = ChildProps<C>;

// props that pass through from Field to concerte field implementation
export interface ChildProps<C extends FilterConfig> {
  config: C;

  // HTML related attrs
  name?: string;
  className?: string;
  onFieldChange?: FieldChangeHandler;

  // tslint:disable-next-line: no-any
  value: any;
}

// tslint:disable-next-line: no-any
export type FieldChangeHandler = (value: any) => void;

export class FilterInput extends React.PureComponent<FilterFieldProps> {
  public render() {
    const { config, ...rest } = this.props;
    switch (config.type) {
      case FilterConfigTypes.Reference:
        return <ReferenceFilterInput {...rest} config={config} />;
      case FilterConfigTypes.String:
        return <StringFilterInput {...rest} config={config} />;
      default:
        throw new Error(
          `Currently does not support Filter with FieldConfigType ${
            config.type
          }`
        );
    }
  }
}
