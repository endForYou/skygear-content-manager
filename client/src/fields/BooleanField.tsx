import * as React from 'react';
import ReactToggle, { ReactToggleElement } from 'react-toggle';
// tslint:disable-next-line: no-submodule-imports
import 'react-toggle/style.css';

import { BooleanFieldConfig } from '../cmsConfig';
import { RequiredFieldProps } from './Field';

export type BooleanFieldProps = RequiredFieldProps<BooleanFieldConfig>;

interface State {
  value: boolean;
}

class BooleanFieldImpl extends React.PureComponent<BooleanFieldProps, State> {
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
      config: { editable },
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

export const BooleanField: React.ComponentClass<
  BooleanFieldProps
> = BooleanFieldImpl;
