import './FilterMenu.scss';

import classnames from 'classnames';
import * as React from 'react';
import Select, { Option, OptionValues } from 'react-select';

import {
  Filter,
  FilterConfig,
  FilterConfigTypes,
  filterFactory,
  FilterType,
} from '../cmsConfig';
import { withEventHandler as withFilterListEventHandler } from '../components/FilterListEventHandler';
import { FilterList } from './FilterList';

const HandledFilterList = withFilterListEventHandler(FilterList);

interface Props {
  className?: string;
  filterConfigs: FilterConfig[];
  filters: Filter[];
  onChangeFilter: (filters: Filter[]) => void;
}

interface State {
  selectedFilterConfig?: FilterConfig;
}

export class FilterMenu extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedFilterConfig: undefined,
    };
  }

  public render() {
    const { className, filterConfigs, filters } = this.props;
    const { selectedFilterConfig } = this.state;

    return (
      <div className={classnames(className, 'filter-menu')}>
        <div className="add-filter">
          <div className="label">Add Filter</div>
          <Select
            className="config-select"
            onChange={this.onSelectedFilterConfigChange}
            placeholder="Select Column"
            value={
              selectedFilterConfig == null ? '' : selectedFilterConfig.name
            }
            options={filterConfigs.map(c => ({
              label: c.label,
              value: c.name,
            }))}
          />
          <button className="btn-add" onClick={this.onFilterAdd}>
            Add
          </button>
        </div>
        <HandledFilterList
          className="filter-list"
          filters={filters}
          filterConfigs={filterConfigs}
          onChangeFilter={this.props.onChangeFilter}
        />
      </div>
    );
  }

  private onSelectedFilterConfigChange = (
    option: Option<OptionValues> | null
  ) => {
    const { filterConfigs } = this.props;
    this.setState({
      selectedFilterConfig:
        option == null
          ? undefined
          : filterConfigs.find(c => c.name === option.value),
    });
  };

  private onFilterAdd = () => {
    const { selectedFilterConfig } = this.state;
    if (selectedFilterConfig == null) {
      return;
    }

    const newFilter = filterFactory(selectedFilterConfig);

    const filters =
      selectedFilterConfig.type === FilterConfigTypes.General
        ? [newFilter]
        : [
            ...this.props.filters.filter(
              f => f.type !== FilterType.GeneralFilterType
            ),
            newFilter,
          ];

    this.props.onChangeFilter(filters);
  };
}
