import './Arrow.css';

import * as React from 'react';

export enum ArrowDirection {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
}

interface ArrowProps {
  className?: string;
  direction: ArrowDirection;
  onClick: () => void;
}

export const Arrow: React.SFC<ArrowProps> = ({
  className,
  direction,
  onClick,
}) => {
  return (
    <button
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
      className={`arrow-button ${className}`}
    >
      <span className={`arrow ${direction}`} />
    </button>
  );
};
