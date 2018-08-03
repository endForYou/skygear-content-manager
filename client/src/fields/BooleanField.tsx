import classnames from 'classnames';
import * as React from 'react';
import ReactToggle, { ReactToggleElement } from 'react-toggle';
// tslint:disable-next-line: no-submodule-imports
import 'react-toggle/style.css';

import { BooleanFieldConfig } from '../cmsConfig';
import { RequiredFieldProps } from './Field';
import { ValidationText } from './validation/ValidationText';

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
      className,
      onFieldChange: _onFieldChange,
      value: _value,
      validationError,
      ...rest,
    } = this.props;

    const disabled = editable === undefined ? true : !editable;

    return (
      <React.Fragment>
        <div
          className={classnames(className, {
            'boolean-display': !!disabled,
            'boolean-input': !disabled,
          })}
        >
          <div className="boolean-toggle-container">
            <ReactToggle
              {...rest}
              checked={this.state.value}
              onChange={this.handleChange}
              disabled={disabled}
            />
          </div>
        </div>
        <ValidationText validationError={validationError} />
      </React.Fragment>
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
