import net from 'node:net';
import crypto from 'node:crypto';

import Logger from '../utils/Logger.js';

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

            conn.on('connect', () => {
                this.logger.info(
                    'connect event fired for socket_id:',
                    this.socket_id,
                );
                this.conn = conn;

                return resolve(this.conn);
            });

            conn.on('error', (err) => {
                this.logger.info(
                    'error event fired for socket_id:',
                    this.socket_id,
                );
                this.#unlock();

                return reject(err);
            });

            conn.on('end', () => {
                this.logger.info(
                    'end event fired for socket_id:',
                    this.socket_id,
                );
                this.#unlock();
            });

            conn.on('drain', () => {
                this.logger.info(
                    'drain event fired for socket_id:',
                    this.socket_id,
                );
                this.#unlock();
            });

            conn.on('close', (err) => {
                this.logger.info(
                    'close event fired for socket_id:',
                    this.socket_id,
                );
                this.#unlock();

                if (err) {
                    this.logger.info(
                        'Connection closed with error for socket_id:',
                        this.socket_id,
                    );
                    return;
                }

                this.logger.info(
                    'Closed connection for socket_id:',
                    this.socket_id,
                );
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
