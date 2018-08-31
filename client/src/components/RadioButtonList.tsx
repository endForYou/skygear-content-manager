import './RadioButtonList.scss';

import classnames from 'classnames';
import * as React from 'react';

interface Props {
  className?: string;
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export class RadioButtonList extends React.PureComponent<Props> {
  public render() {
    const { className, options, selectedIndex, onChange } = this.props;

    return (
      <div className={classnames(className, 'radio-button-list')}>
        {options.map((option, index) => (
          <div key={index} className="radio">
            <label>
              <input
                type="radio"
                name="exportQuery"
                value={index}
                onChange={() => onChange(index)}
                checked={selectedIndex === index}
              />
              <span className="option-title">{options[index]}</span>
            </label>
          </div>
        ))}
      </div>
    );
  }
}
