# DiceDB Node.js Driver

> A fast, promise-based Node.js driver for DiceDB, built for performance and developer joy.

<p align="center">
    <img src="docs/dicedb.png" width="500" />
    <br />
    <img src="https://github.com/Aditya-ds-1806/dicedb-js/actions/workflows/build.yml/badge.svg"/>
    <img src="https://github.com/Aditya-ds-1806/dicedb-js/actions/workflows/test.yml/badge.svg"/>
    <img src="https://img.shields.io/npm/v/dicedb-driver" />
    <img src="https://img.shields.io/node/v/dicedb-driver" />
    <img src="https://img.shields.io/npm/types/dicedb-driver" />
</p>

DiceDB Node.js Driver is a lightweight, promise-based database driver for DiceDB with built-in connection pooling. Designed for performance and simplicity, it lets you interact with DiceDB using a clean, modern API.

## Installation

### Node.js

Install DiceDB Driver using npm or yarn:

```shell
npm install dicedb-driver
# or
yarn add dicedb-driver
```

### Deno

Import DiceDB directly from a CDN like [esm.sh](https://esm.sh):

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

## Command Parity

DiceJS supports a wide range of DiceDB commands. Below is the list of currently supported commands:

| **Command**      | **Supported** |
| ---------------- | ------------- |
| `DECR`           | ✅            |
| `DECRBY`         | ✅            |
| `DEL`            | ✅            |
| `ECHO`           | ✅            |
| `EXISTS`         | ✅            |
| `EXPIRE`         | ✅            |
| `EXPIREAT`       | ✅            |
| `EXPIRETIME`     | ✅            |
| `FLUSHDB`        | ✅            |
| `GET`            | ✅            |
| `GETDEL`         | ✅            |
| `GETEX`          | ✅            |
| `GETSET`         | ✅            |
| `GET.WATCH`      | ✅            |
| `HANDSHAKE`      | ✅            |
| `HGET`           | ✅            |
| `HGETALL`        | ✅            |
| `HGETALL.WATCH`  | ✅            |
| `HGET.WATCH`     | ✅            |
| `HSET`           | ✅            |
| `INCR`           | ✅            |
| `INCRBY`         | ✅            |
| `KEYS`           | ✅            |
| `PING`           | ✅            |
| `SET`            | ✅            |
| `TTL`            | ✅            |
| `TYPE`           | ✅            |
| `UNWATCH`        | ✅            |
| `ZADD`           | ✅            |
| `ZCARD`          | ✅            |
| `ZCARD.WATCH`    | ✅            |
| `ZCOUNT`         | ✅            |
| `ZCOUNT.WATCH`   | ✅            |
| `ZPOPMAX`        | ✅            |
| `ZPOPMIN`        | ✅            |
| `ZRANGE`         | ❌            |
| `ZRANGE.WATCH`   | ❌            |
| `ZRANK`          | ✅            |
| `ZRANK.WATCH`    | ✅            |
| `ZREM`           | ✅            |

> Note: `ZRANGE` and `ZRANGE.WATCH` aren't supported yet since the behavior is
inconsistent. See [#1699](https://github.com/DiceDB/dice/issues/1699).

## Documentation

Check out the documentation on [GitHub](https://github.com/Aditya-ds-1806/dicedb-driver/blob/main/docs/README.md) or explore it on the [docs website](https://aditya-ds-1806.github.io/dicedb-driver) for a nicer reading experience.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
