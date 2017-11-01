import * as React from 'react';

export type StringFieldProps = Props & React.HTMLAttributes<HTMLElement>;

export interface Props {
  content: string;
  name?: string;
}

export class StringField extends React.PureComponent<StringFieldProps> {
  public render() {
    const { content, ...rest } = this.props;
    return <span {...rest}>{content}</span>;
  }
}
