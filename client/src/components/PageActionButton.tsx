import * as React from 'react';

interface PageActionConfigAttrs {
  label?: string;
  name: string;
}

interface Props {
  actionConfig: PageActionConfigAttrs;
  className?: string;
  onClick?: () => void;
}

export const PageActionButton: React.SFC<Props> = props => {
  const { actionConfig, className, onClick } = props;

  return (
    <a href="#" role="button" className={className} onClick={onClick}>
      {actionConfig.label}
    </a>
  );
};
