import * as React from 'react';
import {
  BaseFilterQueryType,
  BooleanFilterQueryType,
  DateTimeFilter,
  DateTimeFilterQueryType,
  Filter,
  FilterQueryType,
  FilterType,
  GeneralFilter,
  NumberFilter,
  NumberFilterQueryType,
  ReferenceFilter,
  ReferenceFilterQueryType,
  StringFilter,
  StringFilterQueryType,
} from '../cmsConfig';
import { Omit } from '../typeutil';

interface FilterListEventHandlerProps {
  filters: Filter[];
  onChangeFilter: (filters: Filter[]) => void;
}

export interface InjectedProps {
  handleQueryTypeChange: (filter: Filter, value: FilterQueryType) => void;
  handleFilterValueChange: (
    filter: Filter,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleNumberValueChange: (filter: Filter, value: number) => void;
  handleReferenceChange: (filter: Filter, value: string[]) => void;
  handleDateTimeValueChange: (filter: Filter, datetime: Date) => void;
  onCloseFilterClicked: (filter: Filter) => void;
}

export function withEventHandler<P extends InjectedProps>(
  ListImpl: React.ComponentType<P>
) {
  type Props = Omit<P, keyof InjectedProps> & FilterListEventHandlerProps;
  return class extends React.PureComponent<Props> {
    public render() {
      return (
        <ListImpl
          {...this.props}
          handleQueryTypeChange={this.handleQueryTypeChange}
          // TODO (Steven-Chan):
          // Should debounce the function
          handleFilterValueChange={this.handleFilterValueChange}
          handleNumberValueChange={this.handleNumberValueChange}
          handleDateTimeValueChange={this.handleDateTimeValueChange}
          handleReferenceChange={this.handleReferenceFilterChange}
          onCloseFilterClicked={this.onCloseFilterClicked}
        />
      );
    }

    private handleQueryTypeChange = (
      filter: Filter,
      value: FilterQueryType
    ) => {
      const filters = this.props.filters.map(f => {
        if (f.id === filter.id) {
          switch (value) {
            case BaseFilterQueryType.IsNull:
            case BaseFilterQueryType.IsNotNull:
              return {
                ...f,
                query: value as BaseFilterQueryType,
              };
            default:
          }
          switch (f.type) {
            case FilterType.StringFilterType:
              return {
                ...f,
                query: value as StringFilterQueryType,
              };
            case FilterType.NumberFilterType:
              return {
                ...f,
                query: value as NumberFilterQueryType,
              };
            case FilterType.BooleanFilterType:
              return {
                ...f,
                query: value as BooleanFilterQueryType,
              };
            case FilterType.DateTimeFilterType:
              return {
                ...f,
                query: value as DateTimeFilterQueryType,
              };
            case FilterType.ReferenceFilterType:
              return {
                ...f,
                query: value as ReferenceFilterQueryType,
              };
            default:
              throw new Error(
                `handleQueryTypeChange does not support FilterType ${f.type}`
              );
          }
        }
        return f;
      });

      this.props.onChangeFilter(filters);
    };

    private handleFilterValueChange = (
      filter: Filter,
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const filters = this.props.filters.map(f => {
        if (f.id === filter.id) {
          switch (filter.type) {
            case FilterType.StringFilterType:
              return { ...(f as StringFilter), value: event.target.value };
            case FilterType.BooleanFilterType:
            case FilterType.DateTimeFilterType:
              return f;
            case FilterType.GeneralFilterType:
              return { ...(f as GeneralFilter), value: event.target.value };
            default:
              throw new Error(
                `handleFilterValueChange does not support FilterType ${f.type}`
              );
          }
        }
        return f;
      });

      this.props.onChangeFilter(filters);
    };

    private handleNumberValueChange = (filter: Filter, value: number) => {
      const filters = this.props.filters.map(f => {
        if (f.id === filter.id) {
          return { ...(f as NumberFilter), value };
        } else {
          return f;
        }
      });

      this.props.onChangeFilter(filters);
    };

    private handleDateTimeValueChange = (filter: Filter, datetime: Date) => {
      const filters = this.props.filters.map(f => {
        if (f.id === filter.id) {
          return { ...(f as DateTimeFilter), value: datetime };
        } else {
          return f;
        }
      });

      this.props.onChangeFilter(filters);
    };

    private handleReferenceFilterChange = (filter: Filter, value: string[]) => {
      const filters = this.props.filters.map(f => {
        if (f.id === filter.id) {
          return { ...(f as ReferenceFilter), values: value };
        } else {
          return f;
        }
      });

      this.props.onChangeFilter(filters);
    };

    private onCloseFilterClicked = (filter: Filter) => {
      const filters = this.props.filters.filter(f => f.id !== filter.id);
      this.props.onChangeFilter(filters);
    };
  } as React.ComponentType<Props>;
}
