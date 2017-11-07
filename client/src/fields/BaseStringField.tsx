import * as React from 'react';

import { RequiredFieldProps } from './Field';

export type BaseStringFieldProps = RequiredFieldProps;

interface State {
  value: string;
}

export class BaseStringField extends React.PureComponent<
  BaseStringFieldProps,
  State
> {
  constructor(props: BaseStringFieldProps) {
    super(props);

    this.state = {
      value: this.props.value,
    };
  }

  public componentWillReceiveProps(nextProps: BaseStringFieldProps) {
    this.setState({ ...this.state, value: nextProps.value });
  }

  // subclass should call this when value changes
  public handleValueChange: (value: string) => void = value => {
    this.setState({ ...this.state, value });

    if (this.props.onFieldChange) {
      this.props.onFieldChange(value);
    }
  };
}
