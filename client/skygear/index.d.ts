// Type definitions for Skygear 1.1.0
// Project: skygear-content-manager
// Definitions by: Kenji Pa <https://twitter.com/limouren>

declare module 'skygear' {
  // tslint:disable-next-line: no-any
  const skygear: Container;
  export default skygear;

  // tslint:disable-next-line: no-any
  export type Record = any;
  export const Record: Record;

  export type RecordCls = {};

  // tslint:disable-next-line: no-any
  export type AnyValue = any;
  export type KVObject = { [key: string]: any };

  export interface AssetAttrs {
    name: string;
    file?: File | Blob;
    contentType?: string;
    url?: string;
    base64?: string;
  }
  export class Asset {
    name: string;
    file?: File | Blob;
    contentType?: string;
    url?: string;
    base64?: string;

    public constructor(attrs: AssetAttrs);
    public static fromJSON(attrs: AssetJson): Asset;
    public toJSON(): AssetJson;
  }

  export interface AssetJson {
    $type: 'asset';
    $name: string;
    $url: string;
  }

  export class Reference {
    constructor(attrs: Record | string);

    readonly id: string;
    public toJSON(): ReferenceJson;
  }

  export interface ReferenceJson {
    $id: string;
    $type: 'ref';
  }

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

  export class Container {
    public auth: AuthContainer;
    public publicDB: Database;

    public config(options: {
      apiKey: string;
      endPoint: string;
    }): Promise<Container>;
  }

  export class AuthContainer {
    public currentUser(): Record | undefined;

    public whoami(): Promise<Record>;

    public loginWithUsername(
      username: string,
      password: string
    ): Promise<Record>;
  }

  export class Database {
    public getRecordByID(id: string): Promise<Record>;

    public save(
      records: Record,
      options?: DatabaseSaveOptions
    ): Promise<Record>;
    public save(
      records: Record[],
      options?: DatabaseSaveOptions
    ): Promise<DatabaseSaveBatchResult>;

    public query<T extends Record = Record>(
      query: Query,
      cacheCallback?: boolean
    ): Promise<QueryResult<T>>;
  }

  interface DatabaseSaveOptions {
    atomic?: Boolean;
  }
  interface DatabaseSaveBatchResult {
    savedRecords: Record[];
    errors: Error[];
  }

  export class Query {
    constructor(recordCls: RecordCls);

    public overallCount: boolean;
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

    public transientInclude(key: string, mapToKey?: string): this;
    public transientIncludeDistance(
      key: string,
      mapToKey: string | undefined,
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

  // an error outlaw that doesn't follow any rules
  // returned by Container & Database Promise failure
  export interface OutlawError {
    status: number;
    error: SkygearError;
  }

  export class SkygearError extends Error {
    code: ErrorCodeType[keyof ErrorCodeType];
    info: KVObject | null;
  }

  export interface ErrorCodeType {
    NotAuthenticated: 101;
    PermissionDenied: 102;
    AccessKeyNotAccepted: 103;
    AccessTokenNotAccepted: 104;
    InvalidCredentials: 105;
    InvalidSignature: 106;
    BadRequest: 107;
    InvalidArgument: 108;
    Duplicated: 109;
    ResourceNotFound: 110;
    NotSupported: 111;
    NotImplemented: 112;
    ConstraintViolated: 113;
    IncompatibleSchema: 114;
    AtomicOperationFailure: 115;
    PartialOperationFailure: 116;
    UndefinedOperation: 117;
    PluginUnavailable: 118;
    PluginTimeout: 119;
    RecordQueryInvalid: 120;
    PluginInitializing: 121;
    UnexpectedError: 1000;
  }

  export const ErrorCodes: ErrorCodeType;
}
