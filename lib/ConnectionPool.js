import { DiceDBSocket } from "./DiceDBSocket.js";

import { delay } from "../utils/index.js";
import Logger from "../utils/Logger.js";

export class ConnectionPool {
    #pool = [];
    #max_pool_size = 20;
    #conn_timeout_ms = 5000;

    constructor(opts = {}) {
        this.host = opts.host;
        this.port = opts.port;
        this.#max_pool_size = opts.max_pool_size ?? this.#max_pool_size;
        this.logger = new Logger('DiceDB:ConnectionPool');
    }

    async connect() {
        const socket = new DiceDBSocket({
            host: this.host,
            port: this.port,
        });

        await socket.connect();
        this.#pool.push(socket);

        this.logger.success('Connection pool created successfully!');
    }

    async #getConnection() {
        while (true) {
            this.logger.info('Looking for free connections in pool...');

            for (const conn of this.#pool) {
                if (conn.acquireLock()) {
                    this.logger.success('Free connection acquired, returning');

                    return conn;
                }
            }

            this.logger.warn('No free connections in pool');

            if (this.#pool.length < this.#max_pool_size) {
                this.logger.info('Trying to create a new socket...');

                const socket = new DiceDBSocket({
                    host: this.host,
                    port: this.port,
                });

                this.#pool.push(socket);
                socket.acquireLock();

                await socket.connect();

                this.logger.info('Created and acquired new socket, returning');

                return socket;
            }

            this.logger.warn('max_pool_size breached, waiting for connections in pool to become free');

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
