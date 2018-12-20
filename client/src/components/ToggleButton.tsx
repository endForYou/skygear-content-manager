import classnames from 'classnames';
import * as React from 'react';

import { PrimaryButton } from './PrimaryButton';

interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isActive: boolean;
}

export function ToggleButton({ className, isActive, ...restProps }: Props) {
  return (
    <PrimaryButton
      {...restProps}
      className={classnames(className, {
        'primary-button': !isActive,
        'primary-button-active': isActive,
      })}
    />
  );
}
