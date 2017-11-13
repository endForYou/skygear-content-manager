import * as React from 'react';

import { FieldConfig } from '../cmsConfig';
import { RequiredFieldProps } from './Field';

interface State {
  value: string;
}

export class BaseStringField<
  C extends FieldConfig,
  Props extends RequiredFieldProps<C>
> extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      value: this.props.value,
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
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
