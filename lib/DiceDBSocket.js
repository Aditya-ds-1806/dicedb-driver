import net from 'node:net';
import crypto from 'node:crypto';

import Logger from '../utils/Logger.js';
import { DiceDBConnectionError } from './Errors.js';

const logger = new Logger('DiceDB:Socket');

export class DiceDBSocket extends net.Socket {
    #is_locked = false;

    constructor(opts) {
        super(opts);
        this.opts = opts;
        this.#init();
    }

    #init() {
        this.socket_id = `SOCK_${crypto.randomUUID()}`;
        this.logger = logger;

        this.logger.info('created new socket_id: ', this.socket_id);
    }

    async connect() {
        return new Promise((resolve, reject) => {
            const { host, port } = this.opts;

            const conn = net.createConnection({
                host,
                port,
            });

            this.logger.info('Initialized socket_id:', this.socket_id);

            // DNS lookup success/failure
            conn.once('lookup', (err) => {
                if (err) {
                    const error = new DiceDBConnectionError({
                        message: `Failed to connect to ${host}:${port}, unable to resolve host, is the address correct?`,
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
                    message: `Failed to connect to ${host}:${port}, is the address correct?`,
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
                this.conn = conn;

                return resolve(this.conn);
            });

            // perform handshake here
            conn.once('ready', () => {
                conn.on('close', (hadError) => {
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
            });
        });
    }

    async write(message) {
        return new Promise((resolve, reject) => {
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
