import * as React from 'react';
import skygear from 'skygear';
import {
  ExportActionConfig
} from '../cmsConfig';

export interface ExportButtonProps {
  actionConfig: ExportActionConfig;
}

export const ExportButton: React.SFC<ExportButtonProps> = props => {
  const { actionConfig } = props;

  const searchParams = new URLSearchParams();
  searchParams.append('export_name', actionConfig.name);
  searchParams.append('key', skygear.auth.accessToken || '');
  const action = `${skygear.endPoint}export?${searchParams}`;
  const title = actionConfig.label || actionConfig.name;

  return (
    <a
      className="btn btn-light"
      href={action}
      target="_blank"
    >
      {title}
    </a>
  );
};
