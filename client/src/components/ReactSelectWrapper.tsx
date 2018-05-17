import * as React from 'react';
import Select from 'react-select';
import { isArray } from 'util';

// tslint:disable:no-any
export function ReactSelectWrapper({ children, ...props }: any) {
  let options = [];
  if (isArray(children)) {
    options = children
      .reduce(
        (acc, opt) => (isArray(opt) ? [...acc, ...opt] : [...acc, opt]),
        []
      )
      .filter((child: any) => child != null)
      .map(mapChildrenToOption);
  } else {
    options = [mapChildrenToOption(children)];
  }

  return <Select {...props} options={options} />;
}

function mapChildrenToOption(children: any) {
  return {
    disabled: children.props.value === '',
    label: children.props.children,
    value: children.props.value,
  };
}
// tslint:enable:no-any
