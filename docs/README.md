<p align="center">
    <img src="./dicedb.png" width="500" />
    <h1 style="color: white;" align="center">DiceDB Driver</h1>
</p>

<p align="center">
    <img src="https://github.com/Aditya-ds-1806/dicedb-js/actions/workflows/build.yml/badge.svg"/>
    <img src="https://github.com/Aditya-ds-1806/dicedb-js/actions/workflows/test.yml/badge.svg"/>
    <img src="https://img.shields.io/npm/v/dicedb-driver" />
    <img src="https://img.shields.io/node/v/dicedb-driver" />
    <img src="https://img.shields.io/npm/types/dicedb-driver" />
    <img src="https://img.shields.io/bundlephobia/minzip/dicedb-driver" />
    <a href='https://coveralls.io/github/Aditya-ds-1806/dicedb-driver?branch=main'>
      <img src='https://coveralls.io/repos/github/Aditya-ds-1806/dicedb-driver/badge.svg?branch=main' alt='Coverage Status' />
    </a>
</p>

DiceDB Driver is a lightweight, promise-based database driver for DiceDB with built-in connection pooling. Designed for performance and simplicity, it lets you interact with DiceDB using a clean, modern API.

Whether you're running commands or subscribing to changes, DiceDB Driver offers a robust foundation with sensible defaults and TypeScript support out of the box.

## Features

- Simple and intuitive API
- Connection pooling for performance and concurrent command execution
- Support for all DiceDB commands, watchable and non-watchable
- Support for both ESM and CJS modules
- Typescript support

## Installation

### Node.js

Install DiceDB Driver using npm or yarn:

```shell
npm install dicedb-driver
# or
yarn add dicedb-driver
```

### Deno

Import DiceDB Client directly from a CDN like [esm.sh](https://esm.sh):

```javascript
import DiceDBClient from "https://esm.sh/dicedb-driver";
```

## Usage

DiceDB Driver ships with support for both CJS and ESM modules.

### ESM

```javascript
import DiceDBClient from "dicedb-driver";

const client = new DiceDBClient({ host: "localhost", port: 7379 });

await client.connect();
const result = await client.ping();

console.log(result);

await client.disconnect();
```

### CommonJS

```javascript
const DiceDBClient = require("dicedb-driver").default;

const client = new DiceDB({ host: "localhost", port: 7379 });

(async () => {
  await client.connect();
  const result = await client.ping();

  console.log(result);

  await client.disconnect();
})();
```

## Debugging

Debugging can be enabled using the standard Node.js `DEBUG` environment variable. Simply set `DEBUG=DiceDB*` to view detailed logs from the DiceDB client. This helps trace internal operations and troubleshoot issues effectively.

## API

### `connect()`

**Signature**: `client.connect(): Promise<void>`

Connects to the DiceDB server. This method must be called before executing any commands.

### `disconnect()`

**Signature**: `client.disconnect(): Promise<boolean>`

Closes all connections in the connection pool and disconnects from the DiceDB server.  
Returns `true` if all connections were successfully closed.

### `decrement()`

**Signature**: `client.decrement(key: string): Promise<DiceDBResponse>`

Decrements the value of a key by 1. Issues the `DECR` command.

### `decrementBy()`

**Signature**: `client.decrementBy(key: string, delta: number): Promise<DiceDBResponse>`

Decrements the value of a key by the specified delta. Issues the `DECRBY` command.

### `delete()`

**Signature**: `client.delete(...keys: string[]): Promise<DiceDBResponse>`

Deletes one or more keys. Issues the `DEL` command.

### `echo()`

**Signature**: `client.echo(message: string): Promise<DiceDBResponse>`

Returns the same message sent to the server. Issues the `ECHO` command.

### `execCommand()`

**Signature**: `client.execCommand(command: string, ...args: any[]): Promise<DiceDBResponse | Readable>`

Executes a raw DiceDB command. All the other methods internally call this method. `command` must be a valid DiceDB command. `args` are the arguments for it.

### `exists()`

**Signature**: `client.exists(...keys: string[]): Promise<DiceDBResponse>`

Checks if one or more keys exist. Issues the `EXISTS` command.

### `expire()`

**Signature**: `client.expire(key: string, seconds: number, condition: "NX" | "XX"): Promise<DiceDBResponse>`

Sets a timeout on a key. Issues the `EXPIRE` command.

### `expireAt()`

**Signature**: `client.expireAt(key: string, timestamp: number, condition: "NX" | "XX" | "GT" | "LT"): Promise<DiceDBResponse>`

Sets a timeout on a key at a specific timestamp. Issues the `EXPIREAT` command.

### `expireTime()`

**Signature**: `client.expireTime(key: string): Promise<DiceDBResponse>`

Gets the expiration time of a key. Issues the `EXPIRETIME` command.

### `flushDB()`

**Signature**: `client.flushDB(): Promise<DiceDBResponse>`

Deletes all keys in the current database. Issues the `FLUSHDB` command.

### `get()`

**Signature**: `client.get(key: string): Promise<DiceDBResponse>`

Gets the value of a key. Issues the `GET` command.

### `getAndDelete()`

**Signature**: `client.getAndDelete(key: string): Promise<DiceDBResponse>`

Gets the value of a key and deletes it. Issues the `GETDEL` command.

### `getAndSetExpiry()`

**Signature**: `client.getAndSetExpiry(key: string, opts: GetAndSetExpiryCommandOptions): Promise<DiceDBResponse>`

Gets the value of a key and sets its expiration. Issues the `GETEX` command.

### `getWatch()`

**Signature**: `client.getWatch(key: string): Promise<Readable>`

Watches a key for changes and returns a [Node.js Readable stream](https://nodejs.org/api/stream.html#readable-streams). Issues the `GET.WATCH` command.

### `getSet()`

**Signature**: `client.getSet(key: string, value: string | number): Promise<DiceDBResponse>`

Sets the value of a key and returns its old value. Issues the `GETSET` command.

### `handshake()`

**Signature**: `client.handshake(execMode: "command" | "watch"): Promise<DiceDBResponse>`

Performs a handshake with the server. Issues the `HANDSHAKE` command. It is called internally by the driver when `connect()` is called.

### `increment()`

**Signature**: `client.increment(key: string): Promise<DiceDBResponse>`

Increments the value of a key by 1. Issues the `INCR` command.

### `incrementBy()`

**Signature**: `client.incrementBy(key: string, delta: number): Promise<DiceDBResponse>`

Increments the value of a key by the specified delta. Issues the `INCRBY` command.

### `ping()`

**Signature**: `client.ping(message: string): Promise<DiceDBResponse>`

Pings the server with an optional message. Issues the `PING` command.

### `set()`

**Signature**:  
`set(key: string, value: string | number, opts: SetCommandOptions): Promise<DiceDBResponse>`

Sets the value of a key with optional parameters. Issues the `SET` command.

### `ttl()`

**Signature**: `client.ttl(key: string): Promise<DiceDBResponse>`

Gets the time-to-live of a key. Issues the `TTL` command.

### `type()`

**Signature**: `client.type(key: string): Promise<DiceDBResponse>`

Gets the type of a key. Issues the `TYPE` command.

### `unwatch()`

**Signature**: `client.unwatch(fingerprint: string): Promise<DiceDBResponse>`

Unwatches a subscription via fingerprint. Issues the `UNWATCH` command.

### `hGet()`

**Signature**: `client.hGet(key: string, field: string): Promise<DiceDBResponse>`

Gets the value of a field in a hash stored at a key. Issues the `HGET` command.

### `hGetAll()`

**Signature**: `client.hGetAll(key: string): Promise<DiceDBResponse>`

Gets all fields and values in a hash stored at a key. Issues the `HGETALL` command.

### `hGetAllWatch()`

**Signature**: `client.hGetAllWatch(key: string): Promise<Readable>`

Watches all fields and values in a hash stored at a key for changes. Issues the `HGETALL.WATCH` command.

### `hGetWatch()`

**Signature**: `client.hGetWatch(key: string, field: string): Promise<Readable>`

Watches a field in a hash stored at a key for changes. Issues the `HGET.WATCH` command.

### `hSet()`

**Signature**: `client.hSet(key: string, map: Record<string, string | number> | Map<string, string | number>): Promise<DiceDBResponse>`

Sets multiple fields in a hash stored at a key. Issues the `HSET` command.

### `keys()`

**Signature**: `client.keys(pattern: string): Promise<DiceDBResponse>`

Get all keys matching a pattern. Issues the `KEYS` command.

### `zAdd()`

**Signature**: `client.zAdd(key: string, map: Record<string, string | number> | Map<string, string | number>, opts?: ZAddCommandOptions): Promise<DiceDBResponse>`

Adds one or more members to a sorted set, or updates their scores. Issues the `ZADD` command.

### `zCard()`

**Signature**: `client.zCard(key: string): Promise<DiceDBResponse>`

Gets the number of members in a sorted set. Issues the `ZCARD` command.

### `zCardWatch()`

**Signature**: `client.zCardWatch(key: string): Promise<Readable>`

Watches the number of members in a sorted set for changes. Issues the `ZCARD.WATCH` command.

### `zCount()`

**Signature**: `client.zCount(key: string, opts?: ZCountOptions): Promise<DiceDBResponse>`

Gets the number of members in a sorted set with scores within the given range. Issues the `ZCOUNT` command.

### `zCountWatch()`

**Signature**: `client.zCountWatch(key: string, opts?: ZCountOptions): Promise<Readable>`

Watches the number of members in a sorted set with scores within the given range. Issues the `ZCOUNT.WATCH` command.

### `zPopMax()`

**Signature**: `client.zPopMax(key: string, count?: number): Promise<DiceDBResponse>`

Removes and returns up to `count` members with the highest scores in a sorted set. Issues the `ZPOPMAX` command.

### `zPopMin()`

**Signature**: `client.zPopMin(key: string, count?: number): Promise<DiceDBResponse>`

Removes and returns up to `count` members with the lowest scores in a sorted set. Issues the `ZPOPMIN` command.

### `zRange()`

**Signature**: `client.zRange(key: string, opts: ZRangeCommandOptions): Promise<DiceDBResponse>`

Gets the range of elements from the sorted set stored at key, with scores ordered from low to high. Issues the `ZRANGE` command.

### `zRangeWatch()`

**Signature**: `client.zRangeWatch(key: string, opts: ZRangeCommandOptions): Promise<DiceDBResponse>`

Watches the range of elements from the sorted set stored at key for changes. Issues the `ZRANGE.WATCH` command.

### `zRank()`

**Signature**: `client.zRank(key: string, member: string): Promise<DiceDBResponse>`

Gets the rank of a member in a sorted set, with scores ordered from low to high. Issues the `ZRANK` command.

### `zRankWatch()`

**Signature**: `client.zRankWatch(key: string, member: string): Promise<Readable>`

Watches the rank of a member in a sorted set for changes. Issues the `ZRANK.WATCH` command.

### `zRem()`

**Signature**: `client.zRem(key: string, ...members: string[]): Promise<DiceDBResponse>`

Removes one or more members from a sorted set. Issues the `ZREM` command.

## Classes

### `DiceDBClient`

**Signature**: `new DiceDBClient(opts: DiceDBOptions)`

This is the default export. Creates a DiceDBClient and initializes the connection pool.

#### Initialization Options

The DiceDB client accepts the following `opts` during initialization:

- **`host`** (`string`, required): The hostname of the DiceDB server.
- **`port`** (`number`, required): The port number of the DiceDB server.
- **`client_id`** (`string`, optional): A unique identifier for the client. Defaults to a generated UUID.
- **`max_pool_size`** (`number`, optional): The maximum number of connections in the connection pool.
- **`query_timeout_ms`** (`number`, optional): Query timeout in milliseconds. Defaults to `5000`.
- **`conn_timeout_ms`** (`number`, optional): Connection timeout in milliseconds. Defaults to `5000`.
- **`idle_timeout_ms`** (`number`, optional): Timeout for idle connections in milliseconds. Defaults to `60000`.

## Types

### `DiceDBOptions`

```typescript
interface DiceDBOptions {
  host: string;
  port: number;
  client_id?: string;
  max_pool_size?: number;
  query_timeout_ms?: number;
  conn_timeout_ms?: number;
  idle_timeout_ms?: number;
}
```

### `DiceDBResponse`

```typescript
interface DiceDBResponse {
  success: boolean;
  error: string | null;
  data: {
    result:
      | string
      | number
      | bigint
      | boolean
      | Uint8Array<ArrayBufferLike>
      | undefined;
    vList: any[];
    attrs: Record<string, any>;
    meta: {
      $typeName: string;
      valueCase: string | undefined;
    };
  };
}
```

### `ZAddCommandOptions`

```typescript
interface ZAddCommandOptions {
    nx?: boolean;   // Only add new elements
    xx?: boolean;   // Only update existing elements
    gt?: boolean;   // Only update existing elements if new score is greater
    lt?: boolean;   // Only update existing elements if new score is less
    ch?: boolean;   // Modify output to total changed elements
    incr?: boolean; // Treat scores as increments to current score
}
```

### `ZCountOptions`

```typescript
interface ZCountOptions {
    min?: number;  // Minimum score (default -inf)
    max?: number;  // Maximum score (default +inf)
}
```
