import * as React from 'react';

import { FieldConfig } from '../cmsConfig';
import { RequiredFieldProps } from './Field';

export interface BaseStringInputFieldState {
  value: string;
}

export class BaseStringInputField<
  C extends FieldConfig,
  Props extends RequiredFieldProps<C>
> extends React.PureComponent<Props, BaseStringInputFieldState> {
  constructor(props: Props) {
    super(props);

    this.state = {
      value: this.props.value,
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({ ...this.state, value: nextProps.value });
  }

  // subclass should call this when value changes
  handleValueChange: (value: string) => void = value => {
    this.setState({ ...this.state, value });

    if (this.props.onFieldChange) {
      this.props.onFieldChange(value);
    }
  };
}
