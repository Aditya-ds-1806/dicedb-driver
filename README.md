# DiceJS

[![Build CI](https://github.com/Aditya-ds-1806/dicedb-js/actions/workflows/build.yml/badge.svg)](https://github.com/Aditya-ds-1806/dicedb-js/actions/workflows/build.yml)
[![Tests CI](https://github.com/Aditya-ds-1806/dicedb-js/actions/workflows/test.yml/badge.svg)](https://github.com/Aditya-ds-1806/dicedb-js/actions/workflows/test.yml)

DiceJS is an easy to use, promise-based database client for [DiceDB](https://dicedb.io/), that supports connection pooling for optimal performance.

## Installation

### Node.js

Install DiceJS using npm or yarn:

```bash
npm install dice-js
# or
yarn add dice-js
```

### Deno

Import DiceJS directly from a CDN like [esm.sh](https://esm.sh):

```typescript
import DiceDB from "https://esm.sh/dice-js";
```

## Usage

### Node.js

#### ES Modules

```typescript
import DiceDB from "dice-js";

const client = new DiceDB({ host: "localhost", port: 7379 });

await client.connect();
const result = await client.ping();

console.log(result);

await client.disconnect();
```

#### CommonJS

```javascript
const DiceDB = require("dice-js");

const client = new DiceDB({ host: "localhost", port: 7379 });

(async () => {
  await client.connect();
  const result = await client.ping();

  console.log(result);

  await client.disconnect();
})();
```

### Deno

```typescript
import DiceDB from "https://esm.sh/dice-js";

const client = new DiceDB({ host: "localhost", port: 7379 });

await client.connect();
const result = await client.ping();

console.log(result);

await client.disconnect();
```

## Command Parity

DiceJS supports a wide range of DiceDB commands. Below is the list of currently supported commands:

| **Command**  | **Supported** |
| ------------ | ------------- |
| `DECR`       | ✅            |
| `DECRBY`     | ✅            |
| `DEL`        | ✅            |
| `ECHO`       | ✅            |
| `EXISTS`     | ✅            |
| `EXPIRE`     | ✅            |
| `EXPIREAT`   | ✅            |
| `EXPIRETIME` | ✅            |
| `FLUSHDB`    | ✅            |
| `GET`        | ✅            |
| `GETDEL`     | ✅            |
| `GETEX`      | ✅            |
| `GET.WATCH`  | ✅            |
| `HANDSHAKE`  | ✅            |
| `INCR`       | ✅            |
| `INCRBY`     | ✅            |
| `PING`       | ✅            |
| `SET`        | ✅            |
| `TTL`        | ✅            |
| `TYPE`       | ✅            |
| `UNWATCH`    | ✅            |

## DiceDB Client Methods

### `connect(): Promise<void>`

Establishes a connection to the DiceDB server. This method must be called before executing any commands.

#### Options

The `DiceDB` client accepts the following options during initialization:

- `host` (string, required): The hostname of the DiceDB server.
- `port` (number, required): The port number of the DiceDB server.
- `client_id` (string, optional): A unique identifier for the client. Defaults to a generated UUID.
- `max_pool_size` (number, optional): The maximum number of connections in the connection pool.
- `query_timeout_ms` (number, optional): The timeout for queries in milliseconds. Defaults to `5000ms`.
- `conn_timeout_ms` (number, optional): The timeout for establishing connections in milliseconds. Defaults to `5000ms`.
- `idle_timeout_ms` (number, optional): The timeout for idle connections in milliseconds. After timeout, socket will be destroyed and removed from connection pool. Defaults to `60000ms`.

---

### `disconnect(): Promise<boolean>`

Closes all connections in the connection pool and disconnects from the DiceDB server. Returns `true` if all connections were successfully closed.

---

### `decrement(key: string): Promise<DiceDBResponse>`

Decrements the value of a key by 1. Issues the `DECR` command.

---

### `decrementBy(key: string, delta: number): Promise<DiceDBResponse>`

Decrements the value of a key by the specified delta. Issues the `DECRBY` command.

---

### `delete(...keys: string[]): Promise<DiceDBResponse>`

Deletes one or more keys. Issues the `DEL` command.

---

### `echo(message: string): Promise<DiceDBResponse>`

Returns the same message sent to the server. Issues the `ECHO` command.

---

### `exists(...keys: string[]): Promise<DiceDBResponse>`

Checks if one or more keys exist. Issues the `EXISTS` command.

---

### `expire(key: string, seconds: number, condition: "NX" | "XX"): Promise<DiceDBResponse>`

Sets a timeout on a key. Issues the `EXPIRE` command.

---

### `expireAt(key: string, timestamp: number, condition: "NX" | "XX" | "GT" | "LT"): Promise<DiceDBResponse>`

Sets a timeout on a key at a specific timestamp. Issues the `EXPIREAT` command.

---

### `expireTime(key: string): Promise<DiceDBResponse>`

Gets the expiration time of a key. Issues the `EXPIRETIME` command.

---

### `flushDB(): Promise<DiceDBResponse>`

Deletes all keys in the current database. Issues the `FLUSHDB` command.

---

### `get(key: string): Promise<DiceDBResponse>`

Gets the value of a key. Issues the `GET` command.

---

### `getAndDelete(key: string): Promise<DiceDBResponse>`

Gets the value of a key and deletes it. Issues the `GETDEL` command.

---

### `getAndSetExpiry(key: string, opts: GetAndSetExpiryCommandOptions): Promise<DiceDBResponse>`

Gets the value of a key and sets its expiration. Issues the `GETEX` command.

---

### `getWatch(key: string): Promise<Readable>`

Watches a key for changes and returns a [Node.js Readable stream](https://nodejs.org/api/stream.html#readable-streams). Issues the `GET.WATCH` command.

---

### `handshake(execMode: "command" | "watch"): Promise<DiceDBResponse>`

Performs a handshake with the server. Issues the `HANDSHAKE` command.

---

### `increment(key: string): Promise<DiceDBResponse>`

Increments the value of a key by 1. Issues the `INCR` command.

---

### `incrementBy(key: string, delta: number): Promise<DiceDBResponse>`

Increments the value of a key by the specified delta. Issues the `INCRBY` command.

---

### `ping(message: string): Promise<DiceDBResponse>`

Pings the server with an optional message. Issues the `PING` command.

---

### `set(key: string, value: string | number, opts: SetCommandOptions): Promise<DiceDBResponse>`

Sets the value of a key with optional parameters. Issues the `SET` command.

---

### `ttl(key: string): Promise<DiceDBResponse>`

Gets the time-to-live of a key. Issues the `TTL` command.

---

### `type(key: string): Promise<DiceDBResponse>`

Gets the type of a key. Issues the `TYPE` command.

---

### `unwatch(fingerprint: string): Promise<DiceDBResponse>`

Unwatches a subscription via fingerprint. Issues the `UNWATCH` command.

---

### `execCommand(command: string, ...args: any[]): Promise<DiceDBResponse | Readable>`

A generic method to executes a DiceDB command. All the above commands call this method internally. The `command` parameter must be a valid DiceDB command, and `args` are the arguments for the command.
