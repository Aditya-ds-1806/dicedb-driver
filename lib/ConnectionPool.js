import { delay } from "../utils/index.js";
import { DiceDBSocket } from "./DiceDBSocket.js";

export class ConnectionPool {
    #pool = [];
    #max_pool_size = 20;
    #conn_timeout_ms = 5000;

    constructor(opts = {}) {
        this.host = opts.host;
        this.port = opts.port;
        this.#max_pool_size = opts.max_pool_size ?? this.#max_pool_size;
    }

    async connect() {
        const socket = new DiceDBSocket({
            host: this.host,
            port: this.port,
        });

        await socket.connect();

        this.#pool.push(socket);
    }

    async #getConnection() {
        while (true) {
            for (const conn of this.#pool) {
                if (conn.acquireLock()) {
                    return conn;
                }
            }

            if (this.#pool.length < this.#max_pool_size) {
                const socket = new DiceDBSocket({
                    host: this.host,
                    port: this.port,
                });

                this.#pool.push(socket);
                socket.acquireLock();

                await socket.connect();

                return socket;
            }

            await delay(10);
        }
    }

    async acquireConnection() {
        return Promise.race([
            this.#getConnection(),
            new Promise((_, reject) => setTimeout(
                () => reject('Timeout: failed to acquire a connection'),
                this.#conn_timeout_ms
            ))
        ])
    }
}
