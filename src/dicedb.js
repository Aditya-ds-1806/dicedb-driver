import crypto from 'node:crypto';

import { ConnectionPool } from '../lib/ConnectionPool.js';
import {
    validateKey,
    validateKeys,
    validateInteger,
    validateTime,
    validateTimestamp,
    validateSetValue,
} from '../lib/Validators.js';
import { responseParser } from '../lib/Parsers.js';
import Logger from '../utils/Logger.js';

import { encodeCommand, decodeResponse } from '../build/cmd.js';

export default class DiceDB {
    constructor(opts = {}) {
        this.opts = opts;
        this.init();
    }

    init() {
        const {
            host,
            port,
            client_id: clientId,
            max_pool_size: maxPoolSize
        } = this.opts;

        this.logger = new Logger('DiceDB');

        if (!host) {
            const err = new Error('Host is required!');
            this.logger.error(err);

            throw err;
        }

        if (!Number.isInteger(port) || port <= 0) {
            const err = new Error('Port is required and must be an interger!');
            this.logger.error(err);

            throw err;
        }

        this.client_id = clientId ?? crypto.randomUUID();

        this.connectionPool = new ConnectionPool({
            port,
            host,
            max_pool_size: maxPoolSize
        });

        this.logger.info(`Initialized DiceDB client ${this.client_id}`);
    }

    async connect() {
        return this.connectionPool.connect();
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
            this.logger.error(err);

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
            this.logger.error(err);

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
            this.logger.error(err);

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

    async ping(message = '') {
        if (typeof message !== 'string') {
            const err = new TypeError('message must be a string!');
            this.logger.error(err);

            throw err;
        }

        if (message) {
            return this.#execCommand('PING', message);
        }

        return this.#execCommand('PING');
    }

    async set(key, value, opts = {}) {
        validateKey(key);
        validateSetValue(value);

        const {
            ex,
            px,
            ex_at: exAt,
            px_at: pxAt,
            xx = false,
            nx = false,
            keepTTL = false
        } = opts;

        const args = [String(key), String(value)];

        if (ex >= 0 && validateTime(ex)) {
            args.push('EX', String(ex));
        } else if (px >= 0 && validateTime(px)) {
            args.push('PX', String(px));
        } else if (exAt >= 0 && validateTimestamp(exAt)) {
            args.push('EXAT', String(exAt));
        } else if (pxAt >= 0 && validateTimestamp(pxAt)) {
            args.push('PXAT', String(pxAt));
        } else if (keepTTL) {
            args.push('KEEPTTL');
        }

        if (typeof xx === 'boolean' && xx) {
            args.push('XX');
        } else if (typeof nx === 'boolean' && nx) {
            args.push('NX');
        }

        return this.#execCommand('SET', ...args);
    }

    async ttl(key) {
        validateKey(key);

        return this.#execCommand('TTL', String(key));
    }

    async type(key) {
        validateKey(key);

        return this.#execCommand('TYPE', String(key));
    }

    async unwatch(fingerprint) {
        return this.#execCommand('UNWATCH', fingerprint);
    }

    async #execCommand(command, ...args) {
        const conn = await this.connectionPool.acquireConnection();

        const msg = encodeCommand({
            cmd: command,
            args: args.filter(arg => arg !== null || arg !== 'undefined')
        });

        const data = await conn.write(msg);

        return { data: responseParser(decodeResponse(data)) }
    }
}
