import './FilterList.scss';

import classnames from 'classnames';
import moment from 'moment';
import * as React from 'react';
// tslint:disable-next-line: no-submodule-imports
import 'react-datetime/css/react-datetime.css';

import {
  BaseFilterQueryType,
  BooleanFilterQueryType,
  DateTimeFilter,
  DateTimeFilterConfig,
  DateTimeFilterQueryType,
  Filter,
  FilterConfig,
  FilterQueryType,
  FilterType,
  GeneralFilter,
  NumberFilter,
  NumberFilterQueryType,
  ReferenceFilter,
  ReferenceFilterConfig,
  ReferenceFilterQueryType,
  StringFilter,
  StringFilterQueryType,
} from '../cmsConfig';
import { TzDatetimeInput } from '../components/TzDatetimeInput';
import { ReferenceFilterInput } from '../filters/ReferenceFilterInput';

import { Option, OptionValues } from 'react-select';
import { ReactSelectWrapper } from './ReactSelectWrapper';

interface FilterListProps {
  className?: string;
  filters: Filter[];
  filterConfigs: FilterConfig[];
  handleQueryTypeChange: (filter: Filter, value: FilterQueryType) => void;
  handleFilterValueChange: (
    filter: Filter,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleReferenceChange: (filter: Filter, value: string[]) => void;
  onCloseFilterClicked: (filter: Filter) => void;
  handleDateTimeValueChange: (filter: Filter, datetime: Date) => void;
}

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm:ssZ';

export class FilterList extends React.PureComponent<FilterListProps> {
  public renderFilter(filter: Filter, index: number) {
    const { className, filterConfigs, onCloseFilterClicked } = this.props;
    const config = filterConfigs.find(c => c.name === filter.name);
    if (config == null) {
      return null;
    }

    return (
      <div key={index} className={classnames(className, 'filter-item')}>
        <button
          onClick={() => onCloseFilterClicked(filter)}
          type="button"
          className="close btn-close primary-color"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="filter-name">{filter.label}</div>
        <div className="filter-select">{this.renderFilterSelect(filter)}</div>
        <div className="filter-input">{this.renderInput(filter, config)}</div>
      </div>
    );
  }

  public renderFilterSelect(filter: Filter) {
    switch (filter.type) {
      case FilterType.StringFilterType:
        return this.renderStringFilterSelect(filter);
      case FilterType.NumberFilterType:
        return this.renderNumberFilterSelect(filter);
      case FilterType.BooleanFilterType:
        return this.renderBooleanFilterSelect(filter);
      case FilterType.DateTimeFilterType:
        return this.renderDateTimeFilterSelect(filter);
      case FilterType.GeneralFilterType:
        return <div />;
      case FilterType.ReferenceFilterType:
        return this.renderReferenceFilterSelect(filter);
      default:
        throw new Error('unsupported FilterType in renderFilterSelect');
    }
  }

  public renderNullFilterSelect(filter: Filter) {
    if (!filter.nullable) {
      return null;
    }
    const { IsNull, IsNotNull } = BaseFilterQueryType;
    return [
      <option key="separator" value="">{` ------ `}</option>,
      <option key="isNull" value={IsNull}>{`Is NULL`}</option>,
      <option key="isNotNull" value={IsNotNull}>{`Is Not NULL`}</option>,
    ];
  }

  public renderStringFilterSelect(filter: Filter) {
    return (
      <ReactSelectWrapper
        clearable={false}
        value={filter.query}
        onChange={(value: Option<OptionValues> | null) =>
          this.handleQueryTypeChange(filter, value)}
      >
        <option value={StringFilterQueryType.EqualTo}>Equal to</option>
        <option value={StringFilterQueryType.NotEqualTo}>Not equal to</option>
        <option value={StringFilterQueryType.Contain}>Contain</option>
        <option value={StringFilterQueryType.NotContain}>Not contain</option>
        {this.renderNullFilterSelect(filter)}
      </ReactSelectWrapper>
    );
  }

  public renderNumberFilterSelect(filter: Filter) {
    return (
      <ReactSelectWrapper
        clearable={false}
        value={filter.query}
        onChange={(value: Option<OptionValues> | null) =>
          this.handleQueryTypeChange(filter, value)}
      >
        <option value={NumberFilterQueryType.EqualTo}>Equal to</option>
        <option value={NumberFilterQueryType.NotEqualTo}>Not equal to</option>
        <option value={NumberFilterQueryType.LessThan}>Less than</option>
        <option value={NumberFilterQueryType.GreaterThan}>Greater than</option>
        <option value={NumberFilterQueryType.LessThanOrEqualTo}>
          Less than or equal to
        </option>
        <option value={NumberFilterQueryType.GreaterThanOrEqualTo}>
          Greater than or equal to
        </option>
        {this.renderNullFilterSelect(filter)}
      </ReactSelectWrapper>
    );
  }

  public renderBooleanFilterSelect(filter: Filter) {
    return (
      <ReactSelectWrapper
        clearable={false}
        value={filter.query}
        onChange={(value: Option<OptionValues> | null) =>
          this.handleQueryTypeChange(filter, value)}
      >
        <option value={BooleanFilterQueryType.True}>True</option>
        <option value={BooleanFilterQueryType.False}>False</option>
        {this.renderNullFilterSelect(filter)}
      </ReactSelectWrapper>
    );
  }

  public renderDateTimeFilterSelect(filter: Filter) {
    return (
      <ReactSelectWrapper
        clearable={false}
        value={filter.query}
        onChange={(value: Option<OptionValues> | null) =>
          this.handleQueryTypeChange(filter, value)}
      >
        <option value={DateTimeFilterQueryType.Before}>Before</option>
        <option value={DateTimeFilterQueryType.After}>After</option>
        {this.renderNullFilterSelect(filter)}
      </ReactSelectWrapper>
    );
  }

  public renderReferenceFilterSelect(filter: Filter) {
    return (
      <ReactSelectWrapper
        clearable={false}
        value={filter.query}
        onChange={(value: Option<OptionValues> | null) =>
          this.handleQueryTypeChange(filter, value)}
      >
        <option value={ReferenceFilterQueryType.Contains}>Contains</option>
        {this.renderNullFilterSelect(filter)}
      </ReactSelectWrapper>
    );
  }

  public renderInput(filter: Filter, config: FilterConfig) {
    switch (filter.query) {
      case BaseFilterQueryType.IsNull:
      case BaseFilterQueryType.IsNotNull:
        return <div />;
      default:
    }
    switch (filter.type) {
      case FilterType.StringFilterType:
        return this.renderStringInput(filter);
      case FilterType.NumberFilterType:
        return this.renderNumberInput(filter);
      case FilterType.BooleanFilterType:
        return <div />;
      case FilterType.DateTimeFilterType:
        return this.renderDateTimeInput(filter, config as DateTimeFilterConfig);
      case FilterType.GeneralFilterType:
        return this.renderGeneralInput(filter);
      case FilterType.ReferenceFilterType:
        return this.renderReferenceInput(
          filter,
          config as ReferenceFilterConfig
        );
      default:
        throw new Error('unsupported FilterType in renderInput');
    }
  }

  public renderStringInput(filter: StringFilter) {
    const { handleFilterValueChange } = this.props;

    return (
      <input
        type="text"
        className="text-input"
        autoFocus={true}
        onChange={event => handleFilterValueChange(filter, event)}
        value={filter.value}
      />
    );
  }

  public renderNumberInput(filter: NumberFilter) {
    const { handleFilterValueChange } = this.props;

    return (
      <input
        type="number"
        className="text-input"
        autoFocus={true}
        onChange={event => handleFilterValueChange(filter, event)}
        value={filter.value}
      />
    );
  }
  public renderDateTimeInput(
    filter: DateTimeFilter,
    config: DateTimeFilterConfig
  ) {
    return (
      <TzDatetimeInput
        className="datetime-input-container"
        inputProps={{ className: 'datetime-input' }}
        dateFormat={DATE_FORMAT}
        timeFormat={TIME_FORMAT}
        value={filter.value}
        onChange={event => this.handleDateTimeChange(filter, event)}
        timezone={config.timezone}
      />
    );
  }

  public renderGeneralInput(filter: GeneralFilter) {
    const { handleFilterValueChange } = this.props;

    return (
      <input
        type="text"
        className="text-input"
        autoFocus={true}
        onChange={event => handleFilterValueChange(filter, event)}
        value={filter.value}
      />
    );
  }

  public renderReferenceInput(
    filter: ReferenceFilter,
    config: ReferenceFilterConfig
  ) {
    const { handleReferenceChange } = this.props;
    return (
      <ReferenceFilterInput
        config={config}
        onFieldChange={value => handleReferenceChange(filter, value)}
        value={filter.values}
      />
    );
  }

  public render() {
    const { filters } = this.props;
    return (
      <div className="filter-list">
        {filters.map((filter, index) => this.renderFilter(filter, index))}
      </div>
    );
  }

  public handleDateTimeChange(
    filter: Filter,
    // tslint:disable-next-line: no-any
    event: string | moment.Moment | React.ChangeEvent<any>
  ) {
    if (!moment.isMoment(event)) {
      return;
    }
    this.props.handleDateTimeValueChange(filter, event.toDate());
  }

  private handleQueryTypeChange(
    filter: Filter,
    value: Option<OptionValues> | null
  ) {
    const { handleQueryTypeChange } = this.props;
    if (value == null || value.value == null) {
      return;
    }

    handleQueryTypeChange(filter, value.value as FilterQueryType);
  }
}
