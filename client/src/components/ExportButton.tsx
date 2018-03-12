import * as React from 'react';
import { ExportActionConfig } from '../cmsConfig';

export interface ExportButtonProps {
  actionConfig: ExportActionConfig;
  onClick?: () => void;
}

export const ExportButton: React.SFC<ExportButtonProps> = props => {
  const { actionConfig, onClick } = props;
  const title = actionConfig.label || actionConfig.name;

  return (
    <a href="#" role="button" className="btn btn-light" onClick={onClick}>
      {title}
    </a>
  );
};
