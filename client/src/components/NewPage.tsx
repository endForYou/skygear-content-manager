import * as React from 'react';
import { Dispatch } from 'react-redux';
// import { push } from 'react-router-redux';
import { Record } from 'skygear';

import { RecordActionDispatcher } from '../actions/record';
import { EditPageConfig } from '../cmsConfig';
import { RootState } from '../states';
import { Remote } from '../types';

export interface NewPageProps {
  config: EditPageConfig;
  dispatch: Dispatch<RootState>;
  savingRecord?: Remote<Record>;
  recordDispatcher: RecordActionDispatcher;
}

// Effectively a Promise Factory
// tslint:disable-next-line: no-any
export type Effect = () => Promise<any>;

interface State {
  recordChange: RecordChange;

  // Side effects produced by fields. They will get executed after record is
  // saved successfully.
  effectChange: RecordEffect;
}

interface RecordChange {
  // tslint:disable-next-line: no-any
  [key: string]: any;
}

interface RecordEffect {
  [key: string]: Effect | undefined;
}

class NewPageImpl extends React.PureComponent<NewPageProps, State> {
  constructor(props: NewPageProps) {
    super(props);

    this.state = {
      effectChange: {},
      recordChange: {},
    };
  }

  public render() {
    return (
      <form>
        <h1 className="display-4">Hello World</h1>
      </form>
    );
  }
}

export const NewPage: React.ComponentClass<NewPageProps> = NewPageImpl;
