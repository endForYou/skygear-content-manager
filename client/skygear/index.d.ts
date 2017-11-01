// Type definitions for Skygear 1.1.0
// Project: skygear-content-manager
// Definitions by: Kenji Pa <https://twitter.com/limouren>

declare module 'skygear' {
  // tslint:disable-next-line: no-any
  const skygear: any;
  export default skygear;

  // tslint:disable-next-line: no-any
  export type Record = any;

  export type RecordCls = {};

  // tslint:disable-next-line: no-any
  export type AnyValue = any;
  export type KVObject = { [key: string]: any };

  export class GeoLocation {
    public latitude: string;
    public longitude: string;

    public static fromJSON(attrs: { $lat: number; $lng: number }): Geolocation;

    constructor(latitude: string, longitude: string);
    toJSON(): GeoLocationJson;
  }

  export interface GeoLocationJson {
    $lat: number;
    $lng: number;
    $type: 'geo';
  }

  export class Database {
    public getRecordByID(id: string): Promise<Record>;

    public query<T extends Record>(
      query: Query,
      cacheCallback?: boolean
    ): Promise<QueryResult<T>>;
  }

  export class Query {
    constructor(recordCls: RecordCls);

    public overallCount: number;
    public limit: number;
    public offset: number;
    public page: number;

    public like(key: string, value: string): this;
    public notLike(key: string, value: string): this;
    public caseInsensitiveLike(key: string, value: string): this;
    public caseInsensitiveNotLike(key: string, value: string): this;

    public equalTo(key: string, value: AnyValue): this;
    public notEqualTo(key: string, value: AnyValue): this;

    public greaterThan(key: string, value: number): this;
    public greaterThanOrEqualTo(key: string, value: number): this;
    public lessThan(key: string, value: number): this;
    public lessThanOrEqualTo(key: string, value: number): this;
    public greaterThanOrEqualTo(key: string, value: number): this;

    public distanceGreaterThan(
      key: string,
      loc: Geolocation,
      distance: number
    ): this;

    public contains(key: string, lookupArray: AnyValue[]): this;
    public notContains(key: string, lookupArray: AnyValue[]): this;

    public containsValue(key: string, needle: string): this;
    public notContainsValue(key: string, needle: string): this;

    // havingRelation(key, rel)
    // notHavingRelation(key, rel)

    public addDescending(key: string): this;
    public addAscending(key: string): this;

    public addDescendingByDistance(key: string, loc: Geolocation): this;
    public addAscendingByDistance(key: string, loc: Geolocation): this;

    public transientInclude(key: string, mapToKey: string): this;
    public transientIncludeDistance(
      key: string,
      mapToKey: string,
      loc: Geolocation
    ): this;

    // get predicate()

    public hash: string;
    public toJSON(): KVObject;

    static clone(query: Query): Query;
    static fromJSON(payload: any): Query;
    static or(...queries: Query[]): Query;
    static not(query: Query): Query;
  }

  export interface QueryResult<T> extends Array<T> {
    overallCount: number;
  }
}
