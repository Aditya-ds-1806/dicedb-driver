const net = require('node:net');
const crypto = require('crypto');

class DiceDBSocket extends net.Socket {
    #is_locked = false;

    constructor(opts) {
        super(opts);
        this.opts = opts;
        this.socket_id = `SOCK_${crypto.randomUUID()}`;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            const { host, port } = this.opts;

            const conn = net.createConnection({
                host,
                port
            });

            conn.on('connect', () => {
                this.conn = conn;
                return resolve(this.conn);
            });

            conn.on('error', (err) => {
                this.#unlock();
                return reject(err);
            });

            conn.on('end', () => {
                this.#unlock();
                console.log('Ended')
            });

            conn.on('drain', () => {
                this.#unlock();
                console.log('that was what I got');
            });

            conn.on('close', (err) => {
                this.#unlock();

                if (err) {
                    console.log(err);
                } else {
                    console.log('Closed connection');
                }
            });
        });
    }

    async write(message) {
        return new Promise((resolve, reject) => {
            this.conn.once('data', (data) => {
                this.#unlock();

                return resolve(data);
            });

            this.conn.write(message, (err) => {
                if (err) {
                    this.#unlock();

                    return reject(err);
                }
            });
        });
    }

    acquireLock() {
        if (this.is_locked) {
            return false;
        }

        this.#lock();

        return true;
    }

    #lock() {
        this.#is_locked = true;
    }

    #unlock() {
        this.#is_locked = false;
    }

    get is_locked() {
        return this.#is_locked;
    }
}

module.exports = DiceDBSocket;
