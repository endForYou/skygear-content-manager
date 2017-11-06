import * as React from 'react';

import { FieldConfig, FieldConfigTypes } from '../cmsConfig';
import { StringField } from './StringField';

// tslint:disable-next-line: no-any
export type FieldChangeHandler = (value: any) => void;

export type RequiredFieldProps = {
  editable?: boolean;
} & ChildProps;

// props that passes from this component to its child field
type ChildProps = {
  onFieldChange?: FieldChangeHandler;

  // tslint:disable-next-line: no-any
  value: any;
} & React.HTMLAttributes<HTMLElement>;

type FieldProps = ChildProps & {
  config: FieldConfig;
};

export class Field extends React.PureComponent<FieldProps> {
  public render() {
    const { config, ...rest } = this.props;
    const childProps = {
      editable: config.editable,
    };
    switch (config.type) {
      case FieldConfigTypes.String:
        return <StringField {...rest} {...childProps} />;
      case FieldConfigTypes.DateTime:
        return null;
    }
  }
}
