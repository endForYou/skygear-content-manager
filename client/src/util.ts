// See https://stackoverflow.com/a/14706877
// tslint:disable-next-line: no-any
export function isObject(o: any): o is { [key: string]: any } {
  return o === Object(o);
}

export function objectFrom<V>(
  entries: Array<[string, V]>
): { [key: string]: V } {
  return entries.reduce((obj, [k, v]) => {
    return { ...obj, [k]: v };
  }, {});
}

export function groupBy<K, V>(xs: V[], keyFn: ((v: V) => K)): Map<K, V[]> {
  const map = new Map<K, V[]>();

  xs.forEach(v => {
    const k = keyFn(v);
    const vs = map.get(k);
    if (vs === undefined) {
      map.set(k, [v]);
    } else {
      vs.push(v);
    }
  });

  return map;
}

export function join<V, S>(xs: V[], sep: S): Array<V | S> {
  return xs.reduce(
    (acc, x) => (acc.length ? [...acc, sep, x] : [x]),
    [] as Array<V | S>
  );
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
