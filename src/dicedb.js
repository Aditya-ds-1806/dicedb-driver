const crypto = require('node:crypto')

const DiceDBSocket = require('../lib/DiceDBSocket');
const { encodeCommand, decodeResponse } = require('../build/cmd');

class DiceDB {
    constructor(opts = {}) {
        this.opts = opts;
        this.client_id = opts.client_id ?? crypto.randomUUID();
    }

    async connect() {
        const { host, port } = this.opts;

        if (!host) {
            const err = new Error('Host is required!');
            reject(err);
        }

        if (!Number.isInteger(port) || port <= 0) {
            const err = new Error('Port is required and must be an interger!');
            reject(err);
        }

        this.conn = new DiceDBSocket({
            host,
            port
        });

        await this.conn.connect();

        return this.conn;
    }

    async handshake(execMode = 'command') {
        if (execMode !== 'command' && execMode !== 'watch') {
            const err = new TypeError('execMode must be one of \'command\' or \'watch\'');
            throw err;
        }

        return this.#execCommand('HANDSHAKE', this.client_id, execMode);
    }

    async ping(message = '') {
        if (typeof message !== 'string') {
            const err = new TypeError('message must be a string!');
            throw err;
        }

        if (message) {
            return this.#execCommand('PING', message);
        }

        return this.#execCommand('PING');
    }

    async get(key) {
        if (typeof key !== 'string' && typeof key !== 'number') {
            const err = new TypeError('key must be a string!');
            throw err;
        }

        key = String(key);

        return this.#execCommand('GET', key);
    }

    async decrement(key) {
        if (typeof key !== 'string' && typeof key !== 'number') {
            const err = new TypeError('key must be a string!');
            throw err;
        }

        key = String(key);

        return this.#execCommand('DECR', key);
    }

    async decrementBy(key, delta) {
        if (typeof key !== 'string' && typeof key !== 'number') {
            const err = new TypeError('key must be a string!');
            throw err;
        }

        if (!Number.isSafeInteger(delta)) {
            const err = new TypeError('delta must be an integer!');
            throw err;
        }

        key = String(key);
        delta = String(delta);

        return this.#execCommand('DECRBY', key, delta);
    }

    async delete(...keys) {
        if (keys.length === 0) {
            const err = new RangeError('No keys provided to delete!')
            throw err;
        }

        return this.#execCommand('DEL', ...keys);
    }

    async #execCommand(command, ...args) {
        const msg = encodeCommand({
            cmd: command,
            args: args.filter(arg => arg !== null || arg !== 'undefined')
        });

        const data = await this.conn.write(msg);

        return { data: decodeResponse(data) }
    }
}

module.exports = DiceDB;
