// Type definitions for Skygear 1.1.0
// Project: skygear-content-manager
// Definitions by: Kenji Pa <https://twitter.com/limouren>

declare module 'skygear' {
  // tslint:disable-next-line: no-any
  const skygear: Container;
  export default skygear;

  // tslint:disable-next-line: no-any
  export class Record {
    _id: string;
    _type: string;

    // meta attrs
    createdAt: Date;
    updatedAt: Date;
    ownerID: string;
    createdBy: string;
    updatedBy: string;
    access: ACL;

    public static extend(recordType: string, instFunc?: Function): RecordCls;

    public constructor(recordType: string, attrs: KVObject);

    readonly recordType: string;
    readonly id: string;

    readonly attributeKeys: string[];
    readonly $transient: KVObject;

    public update(attrs: KVObject): void;

    public setPublicNoAccess(): void;
    public setPublicReadOnly(): void;
    public setPublicReadWriteAccess(): void;
    public setNoAccessForRole(role: Role): void;
    public setReadOnlyForRole(role: Role): void;
    public setReadWriteAccessForRole(role: Role): void;
    public setNoAccessForUser(user: Record): void;
    public setReadOnlyForUser(user: Record): void;
    public setReadWriteAccessForUser(user: Record): void;

    public hasPublicReadAccess(): boolean;
    public hasPublicWriteAccess(): boolean;
    public hasReadAccessForRole(role: Role): boolean;
    public hasWriteAccessForRole(role: Role): boolean;
    public hasReadAccessForUser(user: Record): boolean;
    public hasWriteAccessForUser(user: Record): boolean;

    public toJSON(): KVObject;

    [key: string]: any;
  }

  export type RecordCls = {
    new (attrs?: KVObject): Record;
  };

  // tslint:disable-next-line: no-any
  export type AnyValue = any;
  export type KVObject = { [key: string]: any };

  // TODO: write better definition
  export class ACL {}

  export class Role {
    readonly name: string;
    public constructor(name: string);
  }

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
    public endPoint: string;

    public auth: AuthContainer;
    public publicDB: Database;
    public pubsub: PubsubContainer;

    public UserRecord: RecordCls;

    public config(options: {
      apiKey: string;
      endPoint: string;
    }): Promise<Container>;

    public lambda(action: string, params: AnyValue): Promise<AnyValue>;
  }

  export class AuthContainer {
    public currentUser: Record | undefined;
    public accessToken: string | undefined;

    public whoami(): Promise<Record>;

    public loginWithUsername(
      username: string,
      password: string
    ): Promise<Record>;
    public logout(): Promise<null>;

    public adminResetPassword(user: Record | string, newPassword: string): Promise<string>;

    public fetchUserRole(users: Record[] | string[]): Promise<{[id: string]: Role[]}>;
    public assignUserRole(users: Record[] | string[], roles: Role[] | string[]): Promise<'OK'>;
    public revokeUserRole(users: Record[] | string[], roles: Role[] | string[]): Promise<'OK'>;
  }

  export class PubsubContainer {
    public autoPubsub: boolean;
  }

  export class Database {
    public getRecordByID(id: string): Promise<Record>;

    public save(record: Record, options?: DatabaseSaveOptions): Promise<Record>;
    public save(
      records: Record[],
      options?: DatabaseSaveOptions
    ): Promise<DatabaseSaveBatchResult>;

    public delete(record: Record): Promise<Record>;
    public delete(
      records: Record[] | QueryResult<Record>
    ): Promise<(SkygearError | undefined)[] | undefined>;

    public query<T extends Record = Record>(
      query: Query,
      cacheCallback?: boolean
    ): Promise<QueryResult<T>>;
  }

  interface DatabaseSaveOptions {
    atomic?: Boolean;
  }
  export interface DatabaseSaveBatchResult {
    savedRecords: Record[];
    errors: Error[];
  }

  export class Query {
    constructor(recordCls: RecordCls);

    public recordType: string;
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

    public greaterThan(key: string, value: number | Date): this;
    public greaterThanOrEqualTo(key: string, value: number | Date): this;
    public lessThan(key: string, value: number | Date): this;
    public lessThanOrEqualTo(key: string, value: number | Date): this;
    public greaterThanOrEqualTo(key: string, value: number | Date): this;

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

    // TODO (Steven-Chan):
    // Define type Predicate
    readonly predicate: any[];

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
    message: string;
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
