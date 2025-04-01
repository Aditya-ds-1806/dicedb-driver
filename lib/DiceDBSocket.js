import net from 'node:net';
import { EventEmitter } from 'node:events';

import Logger from '../utils/Logger.js';
import { DiceDBConnectionError, DiceDBTimeoutError } from './Errors.js';
import { timeout, uuid } from '../utils/index.js';
import commandRegistry from './CommandRegistry.js';
import {
    COMMANDS,
    CONN_TIMEOUT_MS,
    IDLE_TIMEOUT_MS,
    QUERY_TIMEOUT_MS,
} from '../src/constants/commands.js';

export class DiceDBSocket extends EventEmitter {
    #is_locked = false;
    #watchable = false;
    #conn_timeout_ms = CONN_TIMEOUT_MS;
    #query_timeout_ms = QUERY_TIMEOUT_MS;
    #idle_timeout_ms = IDLE_TIMEOUT_MS;
    #conn = new net.Socket();

    constructor(opts) {
        super(opts);
        this.#init(opts);
    }

    #init(opts = {}) {
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
        this.#watchable = watchable ?? this.#watchable;
        this.#conn_timeout_ms = connTimeoutMS ?? this.#conn_timeout_ms;
        this.#query_timeout_ms = queryTimeoutMS ?? this.#query_timeout_ms;
        this.#idle_timeout_ms = idleTimeoutMS ?? this.#idle_timeout_ms;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.logger.info(
                `Connecting to ${this.host}:${this.port} on socket_id: ${this.socket_id}`,
            );

            const onLookup = (err) => {
                if (err) {
                    const error = new DiceDBConnectionError({
                        message: `Failed to connect to ${this.host}:${this.port}, unable to resolve host, is the address correct?`,
                        cause: err,
                    });

                    return reject(error);
                }
            };

            const onError = (err) => {
                this.logger.info(
                    'error event fired for socket_id:',
                    this.socket_id,
                );
                this.#unlock();

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

                this.#conn.off('error', onError);
            };

            const onClose = (hadError) => {
                this.logger.error(
                    `close event fired on socket_id: ${this.socket_id} with error: ${hadError}`,
                );
            };

            const onReady = async () => {
                this.#conn.on('close', onClose);

                try {
                    const data = await this.#performHandshake();

                    if (data.result !== 'OK') {
                        throw new DiceDBConnectionError({
                            message: `Connection established but server handshake failed for socket_id: ${this.socket_id}`,
                        });
                    }

                    return resolve(this);
                } catch (err) {
                    this.#conn.removeAllListeners();
                    this.#conn.destroy();
                    reject(err);
                }
            };

            this.#conn.once('lookup', onLookup);
            this.#conn.once('error', onError);
            this.#conn.once('ready', onReady);
            this.#conn.connect(this.port, this.host, onConnect);
        });
    }

    async write(message) {
        const dataPromise = new Promise((resolve, reject) => {
            this.#conn.once('data', (data) => {
                this.logger.info(
                    'data event fired for socket_id:',
                    this.socket_id,
                );

                this.#unlock();

                this.logger.success(
                    'data read complete on socket_id:',
                    this.socket_id,
                );

                return resolve(data);
            });

            this.#conn.write(message, (err) => {
                if (err) {
                    this.#unlock();
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
                    this.#query_timeout_ms,
                    new DiceDBTimeoutError({
                        message: `A timeout occurred when running command: ${this.command}`,
                        timeout: this.#conn_timeout_ms,
                    }),
                ),
            ]);
        } catch (err) {
            this.#conn.removeAllListeners('data');
            this.#unlock();

            throw err;
        }
    }

    subscribe(message) {
        this.#conn.write(message);

        return this;
    }

    async close() {
        return Promise.race([
            new Promise((resolve, reject) => {
                this.#conn.once('error', (err) => {
                    this.#conn.removeAllListeners();
                    this.#conn.destroy();
                    reject(
                        new DiceDBConnectionError({
                            message: 'Failed to close the connection',
                            cause: err,
                        }),
                    );
                });

                this.#conn.end(() => {
                    this.#conn.removeAllListeners();
                    this.#conn.destroy();
                    resolve(true);
                });
            }),
            timeout(
                this.#conn_timeout_ms,
                new DiceDBTimeoutError({
                    message:
                        'A timeout ocurred when trying to close the connection',
                }),
            ),
        ]);
    }

    acquireLock() {
        if (this.is_locked) {
            this.logger.warn(
                'Failed to acquire lock on socket_id:',
                this.socket_id,
            );

            return false;
        }

        this.#lock();

        return true;
    }

    setTimeout(ms, cb) {
        this.#conn.setTimeout(ms, cb);
    }

    destroy() {
        this.#conn.destroy();
    }

    on(eventName, cb) {
        this.#conn.on(eventName, cb);
    }

    async #performHandshake() {
        /**
         * Avoiding HANDSHAKE for non watchable commands due to a bug
         * in the DiceDB server, which stops pushing data to watchable
         * sockets on destroying non watchable sockets.
         */
        if (!this.#watchable) {
            return { result: 'OK' };
        }

        const HandshakeCommand = commandRegistry.get(COMMANDS.HANDSHAKE);

        const handshake = new HandshakeCommand({
            conn: this,
            client_id: this.client_id,
        });

        const { data } = await handshake.exec(
            this.#watchable ? 'watch' : 'command',
        );

        return data;
    }

    #lock() {
        this.#is_locked = true;
        this.logger.info('Acquired lock on socket_id:', this.socket_id);
    }

    #unlock() {
        this.#is_locked = false;
        this.logger.info('Released lock on socket_id:', this.socket_id);
    }

    get is_locked() {
        return this.#is_locked;
    }

    get watchable() {
        return this.#watchable;
    }
}
