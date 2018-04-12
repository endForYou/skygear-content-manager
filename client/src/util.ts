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

// tslint:disable-next-line: no-any
export function get(o: any, keypath: string[] | string): any {
  if (typeof keypath === 'string') {
    return o[keypath];
  }

  return keypath.reduce(
    // tslint:disable-next-line: no-any
    (acc: any, key: string) => (isObject(acc) ? acc[key] : undefined),
    o
  );
}

export function swap<T>(a: T[], from: number, to: number): void {
  [a[from], a[to]] = [a[to], a[from]];
}

export function makeArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  } else if (value == null) {
    return [];
  } else {
    return [value];
  }
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

// tslint:disable:no-any
// True for same shallow value, otherwise false.
export function shallowCompare(
  a: { [key: string]: any },
  b: { [key: string]: any }
) {
  for (const i in a) {
    if (!(i in b)) {
      return false;
    }
  }
  for (const i in b) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
// tslint:enable:no-any

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

export function update<T>(
  arr: T[],
  fn: ((obj: T) => T),
  filter?: ((obj: T) => boolean)
): T[] {
  return arr.map(obj => {
    return filter && !filter(obj) ? obj : fn(obj);
  });
}

export function debouncePromise1<T1, R>(
  f: ((a0: T1) => Promise<R>),
  wait: number
): ((a0: T1) => Promise<R>) {
  type PromiseResolver<T> = (value?: T | PromiseLike<T>) => void;

  let resolver: PromiseResolver<R> | undefined;
  let p: Promise<R> | undefined;
  let timeout: number | undefined;

  return a0 => {
    if (p === undefined) {
      p = new Promise<R>(resolve => {
        resolver = resolve;
      });
    }

    if (timeout !== undefined) {
      clearTimeout(timeout);
    }

    timeout = window.setTimeout(() => {
      f(a0).then(r => {
        if (resolver === undefined) {
          throw new Error('debouncePromise1: resolver is undefined');
        }

        resolver(r);

        p = undefined;
        resolver = undefined;
      });
    }, wait);

    if (p === undefined) {
      throw new Error('debouncePromise1: fatal error: no promise to return');
    }

    return p;
  };
}

// tslint:disable:ban-types no-any
export function debounce(this: any, func: Function, delay: number) {
  let timeout: any;

  return (...args: any[]) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func.call(this, ...args);
      timeout = null;
    }, delay);
  };
}
// tslint:enable:ban-types no-any
