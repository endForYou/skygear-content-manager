import './RecordFormTopbar.scss';

import classnames from 'classnames';
import * as React from 'react';

import { RecordFormActionConfig } from '../cmsConfig';

import { LinkButton } from './LinkButton';
import { SpaceSeperatedList } from './SpaceSeperatedList';

interface Props {
  className?: string;
  title: string;
  actions: RecordFormActionConfig[];
  actionContext: object;
}

export const RecordFormTopbar: React.SFC<Props> = ({
  actionContext,
  actions,
  className,
  title,
}) => {
  return (
    <div className={classnames(className, 'record-form-topbar')}>
      <div className="title">{title}</div>
      <div className="action-container">
        <SpaceSeperatedList>
          {actions.map((action, index) => (
            <LinkButton
              key={index}
              className="record-form-action"
              actionConfig={action}
              context={actionContext}
            />
          ))}
        </SpaceSeperatedList>
      </div>
    </div>
  );
};
