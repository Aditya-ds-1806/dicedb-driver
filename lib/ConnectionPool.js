import { DiceDBSocket } from './DiceDBSocket.js';

import { delay, timeout } from '../utils/index.js';
import Logger from '../utils/Logger.js';
import { DiceDBConnectionError, DiceDBTimeoutError } from './Errors.js';
import {
    CONN_TIMEOUT_MS,
    QUERY_TIMEOUT_MS,
} from '../src/constants/commands.js';

export class ConnectionPool {
    #pool = [];
    #max_pool_size = 20;
    #conn_timeout_ms = CONN_TIMEOUT_MS;
    #query_timeout_ms = QUERY_TIMEOUT_MS;
    #ready = false;

    constructor(opts = {}) {
        this.host = opts.host;
        this.port = opts.port;
        this.client_id = opts.client_id;
        this.#max_pool_size = opts.max_pool_size ?? this.#max_pool_size;
        this.#conn_timeout_ms = opts.conn_timeout_ms ?? this.#conn_timeout_ms;
        this.#query_timeout_ms =
            opts.query_timeout_ms ?? this.#query_timeout_ms;
        this.logger = new Logger('DiceDB:ConnectionPool');
    }

    createDiceDBSocket() {
        const socket = new DiceDBSocket({
            host: this.host,
            port: this.port,
            client_id: this.client_id,
            conn_timeout_ms: this.#conn_timeout_ms,
            query_timeout_ms: this.#query_timeout_ms,
        });

        return socket;
    }

    async connect() {
        const socket = this.createDiceDBSocket();

        try {
            await Promise.race([
                socket.connect(),
                timeout(
                    this.#conn_timeout_ms,
                    new DiceDBTimeoutError({
                        message: 'Connection to the server timed out',
                        timeout: this.#conn_timeout_ms,
                    }),
                ),
            ]);
        } catch (err) {
            socket.destroy();
            throw err;
        }

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

                const socket = this.createDiceDBSocket();

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
            timeout(
                this.#conn_timeout_ms,
                new DiceDBTimeoutError({
                    message:
                        'A timeout occurred while waiting to acquire a connection',
                    timeout: this.#conn_timeout_ms,
                }),
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
