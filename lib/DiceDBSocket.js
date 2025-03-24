import net from 'node:net';

import Logger from '../utils/Logger.js';
import { DiceDBConnectionError, DiceDBTimeoutError } from './Errors.js';
import { timeout, uuid } from '../utils/index.js';
import commandRegistry from './CommandRegistry.js';
import {
    COMMANDS,
    CONN_TIMEOUT_MS,
    QUERY_TIMEOUT_MS,
} from '../src/constants/commands.js';

const logger = new Logger('DiceDB:Socket');

export class DiceDBSocket extends net.Socket {
    #is_locked = false;
    #watchable = false;
    #conn_timeout_ms = CONN_TIMEOUT_MS;
    #query_timeout_ms = QUERY_TIMEOUT_MS;

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
            client_id: clientId,
            watchable = false,
        } = opts;

        this.host = host;
        this.port = port;
        this.client_id = clientId;
        this.socket_id = `SOCK_${uuid()}`;
        this.#conn_timeout_ms = connTimeoutMS ?? this.#conn_timeout_ms;
        this.#query_timeout_ms = queryTimeoutMS ?? this.#query_timeout_ms;
        this.#watchable = watchable ?? this.#watchable;
        this.logger = logger;

        this.logger.info('created new socket_id: ', this.socket_id);
    }

    async connect() {
        return new Promise((resolve, reject) => {
            const conn = net.createConnection({
                host: this.host,
                port: this.port,
            });

            this.logger.info('Initialized socket_id:', this.socket_id);

            // DNS lookup success/failure
            conn.once('lookup', (err) => {
                if (err) {
                    const error = new DiceDBConnectionError({
                        message: `Failed to connect to ${this.host}:${this.port}, unable to resolve host, is the address correct?`,
                        cause: err,
                    });

                    return reject(error);
                }
            });

            /**
             * Connection failure, could be due to a variety of reasons
             * poor network, host is resolvable but wrong server socket etc.
             */
            conn.once('error', (err) => {
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
            });

            // Connection successfully established, can start sending/receiving data
            conn.once('connect', () => {
                this.logger.info(
                    'connect event fired for socket_id:',
                    this.socket_id,
                );
            });

            conn.once('ready', async () => {
                this.conn = conn;

                this.conn.on('close', (hadError) => {
                    if (hadError) {
                        this.logger.error(
                            `close event fired on socket_id: ${this.socket_id} with error`,
                        );
                    } else {
                        this.logger.info(
                            `close event fired on socket_id: ${this.socket_id}`,
                        );
                    }
                });

                const HandshakeCommand = commandRegistry.get(
                    COMMANDS.HANDSHAKE,
                );

                const handshake = new HandshakeCommand({
                    conn: this,
                    client_id: this.client_id,
                    query_timeout_ms: this.#query_timeout_ms,
                });

                try {
                    const { data } = await handshake.exec(
                        this.#watchable ? 'watch' : 'command',
                    );

                    if (data.result === 'OK') {
                        return resolve(this.conn);
                    }

                    throw new DiceDBConnectionError({
                        message: `Connection established but server handshake failed for socket_id: ${this.socket_id}`,
                    });
                } catch (err) {
                    this.conn.removeAllListeners();
                    this.conn.destroy();
                    reject(err);
                }
            });
        });
    }

    async write(message) {
        const dataPromise = new Promise((resolve, reject) => {
            this.conn.once('data', (data) => {
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

            this.conn.write(message, (err) => {
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
            this.conn.removeAllListeners('data');
            this.#unlock();

            throw err;
        }
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
}
