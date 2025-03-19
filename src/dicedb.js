const crypto = require('node:crypto')

const DiceDBSocket = require('../lib/DiceDBSocket');
const {
    validateKey,
    validateKeys,
    validateInteger,
    validateTime,
    validateTimestamp,
} = require('../lib/validators');
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

    async decrement(key) {
        validateKey(key);

        return this.#execCommand('DECR', String(key));
    }

    async decrementBy(key, delta) {
        validateKey(key);
        validateInteger(delta);

        return this.#execCommand('DECRBY', String(key), String(delta));
    }

    async delete(...keys) {
        validateKeys(keys);

        return this.#execCommand('DEL', ...keys.map(String));
    }

    async echo(message = '') {
        message = (message ?? '').toString();

        return this.#execCommand('ECHO', message);
    }

    async exists(...keys) {
        validateKeys(keys);

        const uniqueKeys = new Set(keys.map(String));

        return this.#execCommand('EXISTS', ...uniqueKeys);
    }

    async expire(key, seconds, condition) {
        validateKey(key);
        validateTime(seconds);

        const allowedConditions = ['NX', 'XX'];

        if (!allowedConditions.includes(condition)) {
            const err = new TypeError(`condition must be one of ${allowedConditions.join(', ')}!`);
            throw err;
        }

        return this.#execCommand('EXPIRE', String(key), String(seconds), condition);
    }

    async expireAt(key, timestamp, condition) {
        validateKey(key);
        validateTimestamp(timestamp);

        const allowedConditions = ['NX', 'XX', 'GT', 'LT'];

        if (!allowedConditions.includes(condition)) {
            const err = new TypeError(`condition must be one of ${allowedConditions.join(', ')}!`);
            throw err;
        }

        return this.#execCommand('EXPIREAT', String(key), String(timestamp), condition);
    }

    async expireTime(key) {
        validateKey(key);

        return this.#execCommand('EXPIRETIME', String(key));
    }

    async flushDB() {
        return this.#execCommand('FLUSHDB');
    }

    async get(key) {
        validateKey(key);

        return this.#execCommand('GET', String(key));
    }

    async getAndDelete(key) {
        validateKey(key);

        return this.#execCommand('GETDEL', String(key));
    }

    async getAndSetExpiry(key, opts = {}) {
        key = validateKey(key);

        const { ex, px, ex_at: exAt, px_at: pxAt, persist = false } = opts;
        const args = [key];

        if (ex >= 0 && validateTime(ex)) {
            args.push('EX', String(ex));
        } else if (px >= 0 && validateTime(px)) {
            args.push('PX', String(px));
        } else if (exAt >= 0 && validateTimestamp(exAt)) {
            args.push('EXAT', String(exAt));
        } else if (pxAt >= 0 && validateTimestamp(pxAt)) {
            args.push('PXAT', String(pxAt));
        } else if (typeof persist === 'boolean' && persist) {
            args.push('PERSIST');
        }

        return this.#execCommand('GETEX', ...args);
    }

    async handshake(execMode = 'command') {
        if (execMode !== 'command' && execMode !== 'watch') {
            const err = new TypeError('execMode must be one of \'command\' or \'watch\'');
            throw err;
        }

        return this.#execCommand('HANDSHAKE', this.client_id, execMode);
    }

    async increment(key) {
        validateKey(key);

        return this.#execCommand('INCR', String(key));
    }

    async incrementBy(key, delta) {
        validateKey(key);
        validateInteger(delta);

        return this.#execCommand('INCRBY', String(key), String(delta));
    }

    async ttl(key) {
        validateKey(key);

        return this.#execCommand('TTL', String(key));
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
