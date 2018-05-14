// Type definitions for react-toggle 4.0.2
// Project: react-toggle
// Definitions by: Kenji Pa <https://twitter.com/limouren>

declare module 'react-toggle' {
  import * as React from 'react';

  export default class ReactToggle extends React.Component<ReactToggleProps> {}

  export interface ReactToggleProps {
    className?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: React.ReactEventHandler<ReactToggleElement>;
    onFocus?: React.ReactEventHandler<ReactToggleElement>;
    onBlur?: React.ReactEventHandler<ReactToggleElement>;
    name?: string;
    value?: string;
    id?: string;
    icons?: IconsType;
    'aria-labelledby'?: string;
    'aria-label'?: string;
    disabled?: boolean;
  }

  export interface ReactToggleElement {
    checked: boolean;
  }

  export type IconsType =
    | boolean
    | {
        checked: React.ReactNode;
        unchecked: React.ReactNode;
      };
}
