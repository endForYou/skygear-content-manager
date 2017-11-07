import * as React from 'react';
import ReactToggle, { ReactToggleElement } from 'react-toggle';
// tslint:disable-next-line: no-submodule-imports
import 'react-toggle/style.css';

import { RequiredFieldProps } from './Field';

export type BooleanFieldProps = RequiredFieldProps;

interface State {
  value: boolean;
}

export class BooleanField extends React.PureComponent<
  BooleanFieldProps,
  State
> {
  constructor(props: BooleanFieldProps) {
    super(props);

    this.state = {
      value: this.props.value,
    };
  }

  public componentWillReceiveProps(nextProps: BooleanFieldProps) {
    this.setState({ ...this.state, value: nextProps.value });
  }

  public render() {
    const {
      editable,
      onFieldChange: _onFieldChange,
      value: _value,
      ...rest,
    } = this.props;

    const disabled = editable === undefined ? true : !editable;

    return (
      <ReactToggle
        {...rest}
        checked={this.state.value}
        onChange={this.handleChange}
        disabled={disabled}
      />
    );
  }

  public handleChange: React.ReactEventHandler<ReactToggleElement> = event => {
    const checked = event.currentTarget.checked;

    this.setState({ ...this.state, value: checked });
    if (this.props.onFieldChange) {
      this.props.onFieldChange(checked);
    }
  };
}
