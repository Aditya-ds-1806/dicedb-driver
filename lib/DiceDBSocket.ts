import net from 'node:net';
import { EventEmitter } from 'node:events';

import Logger from '../utils/Logger';
import { DiceDBConnectionError, DiceDBTimeoutError } from './Errors';
import { timeout, uuid } from '../utils/index';
import CommandRegistry from '../src/registry';
import {
    COMMANDS,
    CONN_TIMEOUT_MS,
    IDLE_TIMEOUT_MS,
    QUERY_TIMEOUT_MS,
} from '../src/constants/commands';

import type { ParsedResponse } from './Parsers';

export interface DiceDBSocketOpts {
    host: string;
    port: number;
    conn_timeout_ms?: number;
    query_timeout_ms?: number;
    idle_timeout_ms?: number;
    client_id: string;
    watchable?: boolean;
}

export class DiceDBSocket extends EventEmitter {
    private is_locked = false;
    private watchable = false;
    private conn_timeout_ms = CONN_TIMEOUT_MS;
    private query_timeout_ms = QUERY_TIMEOUT_MS;
    private idle_timeout_ms = IDLE_TIMEOUT_MS;
    private conn: net.Socket;
    private logger!: Logger;
    client_id!: string;
    socket_id!: string;
    host!: string;
    port!: number;

    constructor(opts: DiceDBSocketOpts) {
        super();
        this.conn = new net.Socket();
        this.init(opts);
    }

    private init(opts: DiceDBSocketOpts): void {
        const {
            host,
            port,
            conn_timeout_ms: connTimeoutMS,
            query_timeout_ms: queryTimeoutMS,
            idle_timeout_ms: idleTimeoutMS,
            client_id: clientId,
            watchable = false,
        } = opts;

        this.logger = new Logger('DiceDB:Socket');
        this.client_id = clientId;
        this.socket_id = uuid('sid_');

        this.host = host;
        this.port = port;
        this.watchable = watchable ?? this.watchable;
        this.conn_timeout_ms = connTimeoutMS ?? this.conn_timeout_ms;
        this.query_timeout_ms = queryTimeoutMS ?? this.query_timeout_ms;
        this.idle_timeout_ms = idleTimeoutMS ?? this.idle_timeout_ms;
    }

    async connect(): Promise<this> {
        return new Promise((resolve, reject) => {
            this.logger.info(
                `Connecting to ${this.host}:${this.port} on socket_id: ${this.socket_id}`,
            );

            const onLookup = (err: Error | null) => {
                if (err) {
                    const error = new DiceDBConnectionError({
                        message: `Failed to connect to ${this.host}:${this.port}, unable to resolve host, is the address correct?`,
                        cause: err,
                    });

                    return reject(error);
                }
            };

            const onError = (err: Error) => {
                this.logger.info(
                    'error event fired for socket_id:',
                    this.socket_id,
                );
                this.unlock();

                const error = new DiceDBConnectionError({
                    message: `Failed to connect to ${this.host}:${this.port}, is the address correct?`,
                    cause: err,
                });

                return reject(error);
            };

            const onConnect = () => {
                this.logger.info(
                    'connect event fired for socket_id:',
                    this.socket_id,
                );

                this.conn.off('error', onError);
            };

            const onClose = (hadError: boolean) => {
                this.logger.error(
                    `close event fired on socket_id: ${this.socket_id} with error: ${hadError}`,
                );
            };

            const onReady = async () => {
                this.conn.on('close', onClose);

                try {
                    const data = await this.performHandshake();

                    if (data.result !== 'OK') {
                        throw new DiceDBConnectionError({
                            message: `Connection established but server handshake failed for socket_id: ${this.socket_id}`,
                        });
                    }

                    this.conn.on('data', (data) => this.emit('data', data));

                    return resolve(this);
                } catch (err) {
                    this.conn.removeAllListeners();
                    this.conn.destroy();
                    reject(err);
                }
            };

            this.conn.once('lookup', onLookup);
            this.conn.once('error', onError);
            this.conn.once('ready', onReady);
            this.conn.connect(this.port, this.host, onConnect);
        });
    }

    async write(message: Uint8Array): Promise<Uint8Array> {
        const dataPromise = new Promise<Uint8Array>((resolve, reject) => {
            this.conn.once('data', (data: Uint8Array) => {
                this.logger.info(
                    'data event fired for socket_id:',
                    this.socket_id,
                );

                this.unlock();

                this.logger.success(
                    'data read complete on socket_id:',
                    this.socket_id,
                );

                return resolve(data);
            });

            this.conn.write(message, (err) => {
                if (err) {
                    this.unlock();
                    this.logger.error(
                        'Failed to write data in socket_id:',
                        this.socket_id,
                        err,
                    );

                    return reject(err);
                }

                this.logger.success(
                    'data write complete on socket_id:',
                    this.socket_id,
                );
            });
        });

        try {
            return Promise.race([
                dataPromise,
                timeout(
                    this.query_timeout_ms,
                    new DiceDBTimeoutError({
                        message: 'A timeout occurred when running command',
                        timeout: this.conn_timeout_ms,
                    }),
                ),
            ]);
        } catch (err) {
            this.conn.removeAllListeners('data');
            this.unlock();

            throw err;
        }
    }

    subscribe(message: Uint8Array): this {
        this.conn.write(message);

        return this;
    }

    async close(): Promise<boolean> {
        return Promise.race([
            new Promise<boolean>((resolve, reject) => {
                this.conn.once('error', (err) => {
                    this.conn.removeAllListeners();
                    this.conn.destroy();
                    reject(
                        new DiceDBConnectionError({
                            message: 'Failed to close the connection',
                            cause: err,
                        }),
                    );
                });

                this.conn.end(() => {
                    this.conn.removeAllListeners();
                    this.conn.destroy();
                    resolve(true);
                });
            }),
            timeout(
                this.conn_timeout_ms,
                new DiceDBTimeoutError({
                    message:
                        'A timeout ocurred when trying to close the connection',
                }),
            ),
        ]);
    }

    acquireLock(): boolean {
        if (this.is_locked) {
            this.logger.warn(
                'Failed to acquire lock on socket_id:',
                this.socket_id,
            );

            return false;
        }

        this.lock();

        return true;
    }

    setTimeout(ms: number, cb?: () => void): void {
        this.conn.setTimeout(ms, cb);
    }

    destroy(): void {
        this.conn.destroy();
    }

    private async performHandshake() {
        /**
         * Avoiding HANDSHAKE for non watchable commands due to a bug
         * in the DiceDB server, which stops pushing data to watchable
         * sockets on destroying non watchable sockets.
         */
        if (!this.watchable) {
            return { result: 'OK' };
        }

        const HandshakeCommand = CommandRegistry.get(COMMANDS.HANDSHAKE)!;

        const handshake = new HandshakeCommand({
            conn: this,
            client_id: this.client_id,
        });

        const { data } = (await handshake.exec(
            this.watchable ? 'watch' : 'command',
        )) as ParsedResponse;

        return data;
    }

    private lock(): void {
        this.is_locked = true;
        this.logger.info('Acquired lock on socket_id:', this.socket_id);
    }

    private unlock(): void {
        this.is_locked = false;
        this.logger.info('Released lock on socket_id:', this.socket_id);
    }
}
