import * as React from 'react';

interface Props {
  // tslint:disable-next-line: no-any
  children: any[];
}

export const SpaceSeperatedList: React.SFC<Props> = ({ children }) => {
  if (children.length === 0) {
    return children;
  }

  // tslint:disable-next-line: no-any
  return children.reduce((prev: any, current: any, index: number): any => [
    prev,
    <span key={`space-${index}`}>&nbsp;</span>,
    current,
  ]);
};
