export enum SortOrder {
  Undefined = 'undefined',
  Ascending = 'ascending',
  Descending = 'descending',
}

export interface SortState {
  fieldName: string | undefined;
  order: SortOrder;
}

export function SortState(): SortState {
  return {
    fieldName: undefined,
    order: SortOrder.Undefined,
  };
}
