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
        this.watchable = opts.watchable ?? false;

        if (
            !opts.watchable &&
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

        if (!this.watchable) {
            this.conn = opts.conn;
        }

        this.client_id = opts.client_id;
        this.query_id = `qid_${uuid()}`;
        this.command = this.constructor.command;
        this.connection_pool = opts.connection_pool;
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

        if (!this.watchable) {
            const data = await this.conn.write(msg);
            const response = responseParser(fromBinary(ResponseSchema, data));

            response.data.meta = {
                ...response.data.meta,
                watch: this.watchable,
                command: this.command,
                args: cmdArgs,
                client_id: this.client_id,
                query_id: this.query_id,
                socket_id: this.conn.socket_id,
            };

            return response;
        }

        const socket = this.connection_pool.createDiceDBSocket();

        await socket.connect();
        await socket.write(msg);

        socket.conn.on('data', (data) => {
            const decodedData = responseParser(
                fromBinary(ResponseSchema, data),
            );

            socket.emit('data', decodedData);
        });

        return socket;
    }
}
