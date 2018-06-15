import './FilterTagList.scss';

import classnames from 'classnames';
import * as React from 'react';
import {
  BaseFilterQueryType,
  BooleanFilterQueryType,
  DateTimeFilterConfig,
  Filter,
  FilterConfig,
  FilterType,
} from '../cmsConfig';
import { TzDatetime } from './TzDatetime';

const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ssZ';

function QueryType({ filter }: { filter: Filter }) {
  return <div className="query-type primary-color">{filter.query}</div>;
}

function Value({ config, filter }: { config: FilterConfig; filter: Filter }) {
  switch (filter.query) {
    case BaseFilterQueryType.IsNull:
    case BaseFilterQueryType.IsNotNull:
      return <div />;
    default:
  }

  switch (filter.type) {
    case FilterType.StringFilterType:
    case FilterType.IntegerFilterType:
    case FilterType.GeneralFilterType:
      return <div className="value primary-color">{filter.value}</div>;
    case FilterType.BooleanFilterType:
      return (
        <div className="value primary-color">
          is {filter.query === BooleanFilterQueryType.True ? 'True' : 'False'}
        </div>
      );
    case FilterType.DateTimeFilterType:
      const filterConfig = config as DateTimeFilterConfig;
      return (
        <TzDatetime
          className="value primary-color"
          datetimeFormat={DATETIME_FORMAT}
          value={filter.value}
          timezone={filterConfig.timezone}
        />
      );

    case FilterType.ReferenceFilterType:
      return (
        <div className="value primary-color">{filter.values.join(', ')}</div>
      );
    default:
      throw new Error('unsupported FilterType in renderInput');
  }
}

interface TagProps {
  config: FilterConfig;
  filter: Filter;
  onCloseFilterClicked: () => void;
}

const Tag: React.SFC<TagProps> = ({ config, filter, onCloseFilterClicked }) => {
  return (
    <div className="tag">
      <div className="label">{filter.label}</div>
      <QueryType filter={filter} />
      <Value config={config} filter={filter} />
      <button
        onClick={() => onCloseFilterClicked()}
        type="button"
        className="close btn-close primary-color"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
};

interface FilterTagListProps {
  className?: string;
  filters: Filter[];
  filterConfigs: FilterConfig[];
  onChangeFilter: (filters: Filter[]) => void;
}

export const FilterTagList: React.SFC<FilterTagListProps> = ({
  className,
  filters,
  filterConfigs,
  onChangeFilter,
}) => {
  return (
    <div className={classnames(className, 'filter-tag-list')}>
      {filters.map(filter => {
        const config = filterConfigs.find(c => c.name === filter.name);
        if (config == null) {
          return null;
        }

        return (
          <Tag
            key={filter.id}
            config={config}
            filter={filter}
            onCloseFilterClicked={() =>
              onChangeFilter(filters.filter(f => f.id !== filter.id))}
          />
        );
      })}
    </div>
  );
};
