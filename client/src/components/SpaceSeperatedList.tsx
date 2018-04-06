import * as React from 'react';

export const SpaceSeperatedList: React.SFC = ({
  children,
  // tslint:disable-next-line: no-any
}): React.ReactElement<any> | null => {
  if (children == null || !Array.isArray(children) || children.length === 0) {
    return null;
  }

  return children.reduce(
    // tslint:disable-next-line: no-any
    (prev: any, current: any, index: number): any => [
      prev,
      <span key={`space-${index}`}>&nbsp;</span>,
      current,
    ],
    []
  );
};
