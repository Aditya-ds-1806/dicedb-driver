import { DiceDBSocket } from './DiceDBSocket.js';

import { delay } from '../utils/index.js';
import Logger from '../utils/Logger.js';
import { DiceDBConnectionError, DiceDBTimeoutError } from './Errors.js';

export class ConnectionPool {
    #pool = [];
    #max_pool_size = 20;
    #conn_timeout_ms = 5000;
    #ready = false;

    constructor(opts = {}) {
        this.host = opts.host;
        this.port = opts.port;
        this.#max_pool_size = opts.max_pool_size ?? this.#max_pool_size;
        this.#conn_timeout_ms = opts.timeout ?? this.#conn_timeout_ms;
        this.logger = new Logger('DiceDB:ConnectionPool');
    }

    async connect() {
        const socket = new DiceDBSocket({
            host: this.host,
            port: this.port,
        });

        await Promise.race([
            socket.connect(),
            new Promise((_, reject) =>
                setTimeout(() => {
                    // connected just in time!
                    if (!socket.connecting) {
                        return;
                    }

                    const err = new DiceDBTimeoutError({
                        message: 'Connection to the server timed out',
                        timeout: this.#conn_timeout_ms,
                    });

                    socket.destroy();

                    reject(err);
                }, this.#conn_timeout_ms),
            ),
        ]);

        this.#pool.push(socket);
        this.#ready = true;

        this.logger.success('Connection pool created successfully!');
    }

    async #getConnection() {
        const backoffFactor = 2;
        let retryDelay = 10;

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

            this.logger.warn(
                'max_pool_size breached, waiting for connections in pool to become free',
            );

            retryDelay *= backoffFactor; // exponential backoff

            await delay(retryDelay);
        }
    }

    async acquireConnection() {
        if (!this.ready) {
            const err = new DiceDBConnectionError({
                message: 'Connection pool is not ready',
            });

            throw err;
        }

        return Promise.race([
            this.#getConnection(),
            new Promise((_, reject) =>
                setTimeout(() => {
                    const err = new DiceDBTimeoutError({
                        message:
                            'A timeout occurred while waiting for a connection to become free',
                        timeout: this.#conn_timeout_ms,
                    });

                    reject(err);
                }, this.#conn_timeout_ms),
            ),
        ]);
    }

    get ready() {
        return this.#ready;
    }

    get timeout() {
        return this.#conn_timeout_ms;
    }

    set timeout(ms) {
        this.#conn_timeout_ms = ms;
    }
}
