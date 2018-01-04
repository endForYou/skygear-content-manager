import * as React from 'react';

import { Filter, FilterType, StringFilterQueryType } from '../cmsConfig';

interface FilterListProps {
  filters: Filter[];
  handleQueryTypeChange: (filter: Filter, event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleFilterValueChange: (filter: Filter, event: React.ChangeEvent<HTMLInputElement>) => void; 
  onCloseFilterClicked: (filter: Filter) => void;
}

export class FilterList extends React.PureComponent<FilterListProps> {

  public renderFilter(filter: Filter) {
    const { handleQueryTypeChange, handleFilterValueChange, onCloseFilterClicked } = this.props;
    switch (filter.type) {
      case FilterType.StringFilterType:
        return (
          <div key={filter.id} className="form-inline mb-2">
            <div className="form-group mr-2">
              <label>{filter.label}</label>
            </div>
            <div className="form-group mr-2">
              <select 
                className="form-control"
                value={filter.query}
                onChange={event => handleQueryTypeChange(filter, event)} 
              >
                <option value={StringFilterQueryType.EqualTo}>Equal to</option>
                <option value={StringFilterQueryType.NotEqualTo}>Not equal to</option>
                <option value={StringFilterQueryType.Like}>Like</option>
                <option value={StringFilterQueryType.NotLike}>Not like</option>
              </select>
            </div>
            <div className="form-group mr-4">
              <input 
                type="text"
                className="form-control"
                autoFocus={true}
                onChange={event => handleFilterValueChange(filter, event)}
                value={filter.value}
              />
            </div>
            <div className="form-group">
              <button onClick={() => onCloseFilterClicked(filter)} type="button" className="close">
                <span>&times;</span>
              </button>
            </div>
          </div>
        );
    }
  }

  public render() {
    const { filters } = this.props;
    return filters.map(filter =>
      this.renderFilter(filter)
    );
  }

}
