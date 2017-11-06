import * as React from 'react';

export type StringFieldProps = Props & React.HTMLAttributes<HTMLElement>;

interface Props {
  editable?: boolean;
  changeHandler?: (value: string) => void;

  value: string;
  name?: string; // <input /> name
}

interface State {
  value: string;
}

export class StringField extends React.PureComponent<StringFieldProps, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      value: this.props.value,
    };
  }

  public render() {
    const { changeHandler, editable, ...rest } = this.props;

    if (editable) {
      return (
        <input
          {...rest}
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
        />
      );
    } else {
      return <span {...rest}>{this.state.value}</span>;
    }
  }

  public handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const value = event.target.value;
    this.setState({ ...this.state, value });

    if (this.props.changeHandler) {
      this.props.changeHandler(value);
    }
  };
}
