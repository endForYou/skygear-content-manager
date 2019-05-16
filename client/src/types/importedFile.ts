import * as moment from 'moment';

export interface ImportedFile {
  name: string;
  uploadedAt: Date;
  url: string;
  size: number;
  contentType: string;
}

// tslint:disable-next-line:no-any
export function deserializeImportedFile(input: any): ImportedFile {
  return {
    name: input.id,
    size: input.size,
    uploadedAt: moment(input.uploaded_at).toDate(),
    url: input.url,
    contentType: input.content_type,
  };
}
