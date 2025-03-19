const net = require('node:net');

class DiceDBSocket extends net.Socket {
    constructor(opts) {
        super(opts);
        this.opts = opts;
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
                return reject(err);
            });

            conn.on('end', () => {
                console.log('Ended')
            });

            conn.on('drain', () => {
                console.log('that was what I got');
            });

            conn.on('close', (err) => {
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
                return resolve(data);
            });

            this.conn.write(message, (err) => {
                if (err) {
                    return reject(err);
                }
            });
        });
    }
}

module.exports = DiceDBSocket;
