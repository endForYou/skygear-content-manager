import * as React from 'react';
import { Link } from 'react-router-dom';

export interface ReferenceLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  recordName: string;
  recordId: string;
}

export const ReferenceLink: React.SFC<ReferenceLinkProps> = props => {
  const { children, recordName, recordId, ...rest } = props;
  const cmsRecordId = `${recordName}/${recordId}`;
  return (
    <Link {...rest} to={`/record/${cmsRecordId}`} title={cmsRecordId}>
      {children}
    </Link>
  );
};
