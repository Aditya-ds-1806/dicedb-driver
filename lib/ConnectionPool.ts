import { DiceDBSocket } from './DiceDBSocket';

import { delay, timeout } from '../utils/index';
import Logger from '../utils/Logger';
import { DiceDBConnectionError, DiceDBTimeoutError } from './Errors';
import {
    CONN_TIMEOUT_MS,
    IDLE_TIMEOUT_MS,
    QUERY_TIMEOUT_MS,
} from '../src/constants/commands';

interface ConnectionPoolOptions {
    host: string;
    port: number;
    client_id: string;
    max_pool_size?: number;
    conn_timeout_ms?: number;
    query_timeout_ms?: number;
    idle_timeout_ms?: number;
}

export class ConnectionPool {
    private pool: DiceDBSocket[] = [];
    private max_pool_size: number = 20;
    private conn_timeout_ms: number = CONN_TIMEOUT_MS;
    private query_timeout_ms: number = QUERY_TIMEOUT_MS;
    private idle_timeout_ms: number = IDLE_TIMEOUT_MS;
    private ready: boolean = false;
    private host: string;
    private port: number;
    private client_id: string;
    private logger: Logger;

    constructor(opts: ConnectionPoolOptions) {
        this.host = opts.host;
        this.port = opts.port;
        this.client_id = opts.client_id;
        this.logger = new Logger('DiceDB:ConnectionPool');

        this.max_pool_size = opts.max_pool_size ?? this.max_pool_size;
        this.conn_timeout_ms = opts.conn_timeout_ms ?? this.conn_timeout_ms;
        this.query_timeout_ms = opts.query_timeout_ms ?? this.query_timeout_ms;
        this.idle_timeout_ms = opts.idle_timeout_ms ?? this.idle_timeout_ms;
    }

    private createDiceDBSocket({
        watchable,
    }: { watchable?: boolean } = {}): DiceDBSocket {
        const socket = new DiceDBSocket({
            host: this.host,
            port: this.port,
            client_id: this.client_id,
            conn_timeout_ms: this.conn_timeout_ms,
            query_timeout_ms: this.query_timeout_ms,
            watchable,
        });

        socket.on('error', (err) => {
            this.logger.warn(
                `socket errored: removing ${socket.socket_id} from pool: ${err}`,
            );

            this.removeSocket(socket);
        });

        socket.on('end', () => {
            this.logger.warn(
                `socket ended: removing ${socket.socket_id} from pool`,
            );

            this.removeSocket(socket);
        });

        if (!watchable) {
            socket.setTimeout(this.idle_timeout_ms, () => {
                this.logger.warn(
                    `socket ${socket.socket_id} timed out, ${this.pool.length} sockets remaining`,
                );

                this.removeSocket(socket);
            });
        }

        return socket;
    }

    async connect(): Promise<void> {
        const socket = this.createDiceDBSocket();

        try {
            await Promise.race([
                socket.connect(),
                timeout(
                    this.conn_timeout_ms,
                    new DiceDBTimeoutError({
                        message: 'Connection to the server timed out',
                        timeout: this.conn_timeout_ms,
                    }),
                ),
            ]);
        } catch (err) {
            socket.destroy();
            throw err;
        }

        this.pool.push(socket);
        this.ready = true;

        this.logger.success('Connection pool created successfully!');
    }

    private async getConnection(): Promise<DiceDBSocket> {
        const backoffFactor = 2;
        let retryDelay = 10;

        while (true) {
            this.logger.info('Looking for free connections in pool...');

            for (const conn of this.pool) {
                if (conn.acquireLock()) {
                    this.logger.success('Free connection acquired, returning');
                    conn.setTimeout(this.idle_timeout_ms);

                    return conn;
                }
            }

            this.logger.warn('No free connections in pool');

            if (this.pool.length < this.max_pool_size) {
                this.logger.info('Trying to create a new socket...');

                const socket = this.createDiceDBSocket();

                this.pool.push(socket);
                socket.acquireLock();

                await socket.connect();

                this.logger.info('Created and acquired new socket, returning');

                return socket;
            }

            this.logger.warn(
                'max_pool_size breached, waiting for connections in pool to become free',
            );

            retryDelay *= backoffFactor;

            await delay(retryDelay);
        }
    }

    async acquireConnection({
        watchable = false,
    }: { watchable?: boolean } = {}): Promise<DiceDBSocket> {
        if (watchable) {
            const socket = this.createDiceDBSocket({ watchable });
            await socket.connect();

            return socket;
        }

        if (!this.ready) {
            const err = new DiceDBConnectionError({
                message: 'Connection pool is not ready',
            });

            throw err;
        }

        return Promise.race([
            this.getConnection(),
            timeout(
                this.conn_timeout_ms,
                new DiceDBTimeoutError({
                    message:
                        'A timeout occurred while waiting to acquire a connection',
                    timeout: this.conn_timeout_ms,
                }),
            ),
        ]);
    }

    removeSocket(socket: DiceDBSocket): void {
        const idx = this.pool.findIndex(
            (s) => s.socket_id === socket.socket_id,
        );

        if (idx !== -1) {
            socket.removeAllListeners();
            socket.destroy();

            this.pool.splice(idx, 1);
        }
    }

    get timeout(): number {
        return this.conn_timeout_ms;
    }

    set timeout(ms: number) {
        this.conn_timeout_ms = ms;
    }
}
