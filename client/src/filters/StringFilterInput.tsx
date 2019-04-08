import * as React from 'react';

import { StringFilterConfig } from '../cmsConfig';
import { debounce } from '../util';
import { FieldChangeHandler, RequiredFilterInputProps } from './FilterInput';

export interface StringFilterInputState {
  value: string;
}

export type StringFilterInputProps = RequiredFilterInputProps<
  StringFilterConfig
>;

export class StringFilterInput extends React.PureComponent<
  StringFilterInputProps,
  StringFilterInputState
> {
  onFieldChange: FieldChangeHandler | undefined;
  constructor(props: StringFilterInputProps) {
    super(props);

    if (this.props.onFieldChange) {
      this.onFieldChange = debounce(this.props.onFieldChange, 300).bind(this);
    }

    this.state = {
      value: '',
    };
  }

  render() {
    const { onFieldChange: _, ...rest } = this.props;

    return (
      <input
        {...rest}
        type="text"
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }

  private handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
    this.setState({ ...this.state, value });

    if (this.onFieldChange) {
      this.onFieldChange(value);
    }
  };
}
