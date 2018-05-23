import * as React from 'react';
import { ExportActionConfig } from '../cmsConfig';

export interface ExportButtonProps {
  actionConfig: ExportActionConfig;
  className?: string;
  onClick?: () => void;
}

export const ExportButton: React.SFC<ExportButtonProps> = props => {
  const { actionConfig, className, onClick } = props;
  const title = actionConfig.label || actionConfig.name;

  return (
    <a href="#" role="button" className={className} onClick={onClick}>
      {title}
    </a>
  );
};
