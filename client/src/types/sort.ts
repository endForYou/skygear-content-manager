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

export function isSortStateEqual(s1: SortState, s2: SortState): boolean {
  return s1.fieldName === s2.fieldName && s1.order === s2.order;
}
