import { Readable } from 'stream';
import EventEmitter from 'events';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';

import { CommandSchema, ResponseSchema } from '../generated/cmd_pb.js';
import { uuid } from '../utils/index.js';
import { DiceDBCommandError } from './Errors.js';
import { responseParser } from './Parsers.js';

export default class Command extends EventEmitter {
    constructor(opts = {}) {
        super();
        this.#init(opts);
    }

    #init(opts = {}) {
        if (
            !(
                typeof opts.conn?.write === 'function' &&
                typeof opts.conn?.socket_id === 'string'
            )
        ) {
            throw new DiceDBCommandError({
                message: 'opts.conn must be a DiceDBSocket',
            });
        }

        if (typeof opts.client_id !== 'string' || opts.client_id === '') {
            throw new DiceDBCommandError({
                message: 'client_id is required!',
            });
        }

        if (
            typeof this.constructor.command !== 'string' ||
            this.constructor.command === ''
        ) {
            throw new DiceDBCommandError({
                message: 'command getter must be specified!',
            });
        }

        this.conn = opts.conn;
        this.client_id = opts.client_id;
        this.query_id = `qid_${uuid()}`;
        this.command = this.constructor.command;
        this.connection_pool = opts.connection_pool;
    }

    static get watchable() {
        return false;
    }

    async exec(...args) {
        const cmdArgs = args.filter(
            (arg) => arg !== null || arg !== 'undefined',
        );

        const msg = toBinary(
            CommandSchema,
            create(CommandSchema, {
                cmd: this.command,
                args: cmdArgs,
            }),
        );

        const data = await this.conn.write(msg);
        const response = responseParser(fromBinary(ResponseSchema, data));

        Object.assign(response.data.meta, {
            watch: this.watchable,
            command: this.command,
            args: cmdArgs,
            client_id: this.client_id,
            query_id: this.query_id,
            socket_id: this.conn.socket_id,
        });

        return response;
    }
}

export class WatchableCommand extends Command {
    constructor(opts = {}) {
        super(opts);
        this.#init(opts);
    }

    #init(opts = {}) {
        if (
            !(
                typeof opts.conn?.write === 'function' &&
                typeof opts.conn?.socket_id === 'string'
            )
        ) {
            throw new DiceDBCommandError({
                message: 'opts.conn must be a DiceDBSocket',
            });
        }

        if (typeof opts.client_id !== 'string' || opts.client_id === '') {
            throw new DiceDBCommandError({
                message: 'client_id is required!',
            });
        }

        if (
            typeof this.constructor.command !== 'string' ||
            this.constructor.command === ''
        ) {
            throw new DiceDBCommandError({
                message: 'command getter must be specified!',
            });
        }

        this.conn = opts.conn;
        this.client_id = opts.client_id;
        this.query_id = `qid_${uuid()}`;
        this.command = this.constructor.command;
        this.connection_pool = opts.connection_pool;
    }

    static get watchable() {
        return true;
    }

    async exec(...args) {
        const cmdArgs = args.filter(
            (arg) => arg !== null || arg !== 'undefined',
        );

        const msg = toBinary(
            CommandSchema,
            create(CommandSchema, {
                cmd: this.command,
                args: cmdArgs,
            }),
        );

        const socket = this.conn.subscribe(msg);
        const readable = new Readable({ read() {}, objectMode: true });

        socket.on('error', (err) => readable.destroy(err));
        socket.on('data', (data) => {
            const decodedData = responseParser(
                fromBinary(ResponseSchema, data),
            );

            Object.assign(decodedData.data.meta, {
                watch: true,
                command: this.command,
                args: cmdArgs,
                client_id: this.client_id,
                query_id: this.query_id,
                socket_id: this.conn.socket_id,
            });

            readable.push(decodedData);
        });

        return readable;
    }
}
