import * as React from 'react';

export interface NullFieldProps {
  className?: string;
  name?: string;
}

export const NullField: React.SFC<NullFieldProps> = props => {
  return (
    <div {...props} style={{ color: 'silver' }}>
      NULL
    </div>
  );
};
