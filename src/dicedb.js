const net = require('node:net');
const crypto = require('node:crypto')

const { encodeCommand, decodeResponse } = require('../build/cmd');

class DiceDB {
    constructor(opts = {}) {
        this.opts = opts;
        this.client_id = opts.client_id ?? crypto.randomUUID();
    }

    async connect() {
        return new Promise((resolve, reject) => {
            const { host, port } = this.opts;

            if (!host) {
                const err = new Error('Host is required!');
                reject(err);
            }

            if (!Number.isInteger(port) || port <= 0) {
                const err = new Error('Port is required and must be an interger!');
                reject(err);
            }

            this.conn = net.createConnection({
                host,
                port
            });

            this.conn.on('connect', () => {
                console.log('connected to DB')
                resolve(this.conn);
            });

            this.conn.on('error', reject);

            this.conn.on('end', () => {
                console.log('Ended')
            });

            this.conn.on('drain', () => {
                console.log('that was what I got');
            });

            this.conn.on('close', (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Closed connection');
                }
            });
        })
    }

    async handshake(execMode = 'command') {
        if (execMode !== 'command' && execMode !== 'watch') {
            const err = new TypeError('execMode must be one of \'command\' or \'watch\'');
            throw err;
        }

        return new Promise((resolve, reject) => {
            const msg = encodeCommand({
                cmd: 'HANDSHAKE',
                args: [this.client_id, 'command']
            });

            this.conn.once('data', (data) => {
                return resolve({ data: decodeResponse(data) });
            });

            this.conn.write(msg, (err) => {
                if (err) {
                    return reject(err);
                }
            });
        });
    }

    async ping(message = '') {
        if (typeof message !== 'string') {
            const err = new TypeError('message must be a string!');
            throw err;
        }

        return new Promise((resolve, reject) => {
            const msg = encodeCommand({
                cmd: 'PING',
                args: message ? [message] : []
            });

            this.conn.once('data', (data) => {
                return resolve({ data: decodeResponse(data) });
            });

            this.conn.write(msg, (err) => {
                if (err) {
                    return reject(err);
                }
            });
        });
    }

    async get(key) {
        if (typeof key !== 'string' && typeof key !== 'number') {
            const err = new TypeError('key must be a string!');
            throw err;
        }

        key = String(key);

        return new Promise((resolve, reject) => {
            const msg = encodeCommand({
                cmd: 'GET',
                args: [key]
            });

            this.conn.once('data', (data) => {
                return resolve({ data: decodeResponse(data) });
            });

            this.conn.write(msg, (err) => {
                if (err) {
                    return reject(err);
                }
            });
        })
    }
}

module.exports = DiceDB;
