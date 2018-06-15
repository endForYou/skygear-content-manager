export interface ImportResult {
  successCount: number;
  errorCount: number;

  result: ImportResultItem[];
}

export interface ImportResultItem {
  // tslint:disable-next-line:no-any
  [key: string]: any;
  _type: 'record' | 'error';
}
