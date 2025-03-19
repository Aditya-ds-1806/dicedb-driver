const crypto = require('node:crypto')

const DiceDBSocket = require('../lib/DiceDBSocket');
const { encodeCommand, decodeResponse } = require('../build/cmd');
const { validateKey, validateKeys } = require('../lib/validators');

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
        validateKey(key);

        key = String(key);

        return this.#execCommand('GET', key);
    }

    async decrement(key) {
        validateKey(key);

        key = String(key);

        return this.#execCommand('DECR', key);
    }

    async decrementBy(key, delta) {
        validateKey(key);

        if (!Number.isSafeInteger(delta)) {
            const err = new TypeError('delta must be an integer!');
            throw err;
        }

        key = String(key);
        delta = String(delta);

        return this.#execCommand('DECRBY', key, delta);
    }

    async delete(...keys) {
        validateKeys(keys);

        return this.#execCommand('DEL', ...keys);
    }

    async echo(message = '') {
        message = (message ?? '').toString();

        return this.#execCommand('ECHO', message);
    }

    async exists(...keys) {
        validateKeys(keys);

        const uniqueKeys = new Set(keys);

        return this.#execCommand('EXISTS', ...uniqueKeys);
    }

    async expire(key, seconds, condition) {
        validateKey(key);

        if (!Number.isFinite(seconds)) {
            const err = new TypeError('seconds must be a number!');
            throw err;
        }

        const allowedConditions = ['NX', 'XX'];

        if (!allowedConditions.includes(condition)) {
            const err = new TypeError(`condition must be one of ${allowedConditions.join(', ')}!`);
            throw err;
        }

        key = String(key);
        seconds = String(seconds);

        return this.#execCommand('EXPIRE', key, seconds, condition);
    }

    async expireAt(key, timestamp, condition) {
        validateKey(key);

        if (!Number.isFinite(timestamp)) {
            const err = new TypeError('timestamp must be a number!');
            throw err;
        }

        const allowedConditions = ['NX', 'XX', 'GT', 'LT'];

        if (!allowedConditions.includes(condition)) {
            const err = new TypeError(`condition must be one of ${allowedConditions.join(', ')}!`);
            throw err;
        }

        key = String(key);
        timestamp = String(timestamp);

        return this.#execCommand('EXPIREAT', key, timestamp, condition);
    }

    async expireTime(key) {
        validateKey(key);

        key = String(key);

        return this.#execCommand('EXPIRETIME', key);
    }

    async flushDB() {
        return this.#execCommand('FLUSHDB');
    }

    async ttl(key) {
        validateKey(key);

        key = String(key);

        return this.#execCommand('TTL', key);
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
