import classnames from 'classnames';
import * as React from 'react';

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export function PrimaryButton({ className, ...restProps }: Props) {
  return (
    <button
      {...restProps}
      className={classnames(className, 'primary-button')}
    />
  );
}
