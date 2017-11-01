// See https://stackoverflow.com/a/14706877
// tslint:disable-next-line: no-any
export function isObject(o: any): boolean {
  return o === Object(o);
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

export function humanize(str: string): string {
  return capitalize(str.replace(/_/g, ' '));
}

export function getPath(urlString: string): string {
  const url = new URL(urlString);
  return url.pathname;
}
