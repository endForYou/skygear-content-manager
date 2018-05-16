import * as React from 'react';
import {
  BaseFilterQueryType,
  BooleanFilterQueryType,
  DateTimeFilter,
  DateTimeFilterQueryType,
  Filter,
  FilterType,
  GeneralFilter,
  IntegerFilter,
  IntegerFilterQueryType,
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
  handleQueryTypeChange: (
    filter: Filter,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  handleFilterValueChange: (
    filter: Filter,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
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
          handleDateTimeValueChange={this.handleDateTimeValueChange}
          handleReferenceChange={this.handleReferenceFilterChange}
          onCloseFilterClicked={this.onCloseFilterClicked}
        />
      );
    }

    private handleQueryTypeChange = (
      filter: Filter,
      event: React.ChangeEvent<HTMLSelectElement>
    ) => {
      if (!event.target.value.length) {
        return;
      }
      const filters = this.props.filters.map(f => {
        if (f.id === filter.id) {
          switch (event.target.value) {
            case BaseFilterQueryType.IsNull:
            case BaseFilterQueryType.IsNotNull:
              return {
                ...f,
                query: BaseFilterQueryType[event.target.value],
              };
            default:
          }
          switch (filter.type) {
            case FilterType.StringFilterType:
              return {
                ...f,
                query: StringFilterQueryType[event.target.value],
              };
            case FilterType.IntegerFilterType:
              return {
                ...f,
                query: IntegerFilterQueryType[event.target.value],
              };
            case FilterType.BooleanFilterType:
              return {
                ...f,
                query: BooleanFilterQueryType[event.target.value],
              };
            case FilterType.DateTimeFilterType:
              return {
                ...f,
                query: DateTimeFilterQueryType[event.target.value],
              };
            case FilterType.ReferenceFilterType:
              return {
                ...f,
                query: ReferenceFilterQueryType[event.target.value],
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
            case FilterType.IntegerFilterType:
              return {
                ...(f as IntegerFilter),
                value: Number(event.target.value),
              };
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
