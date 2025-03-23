import { encodeCommand, decodeResponse } from '../build/cmd.js';
import { QUERY_TIMEOUT_MS } from '../src/constants/commands.js';
import { DiceDBSocket } from './DiceDBSocket.js';
import { DiceDBCommandError } from './Errors.js';
import { responseParser } from './Parsers.js';

export default class Command {
    #query_timeout_ms = QUERY_TIMEOUT_MS;

    constructor(opts = {}) {
        if (!(opts.conn instanceof DiceDBSocket)) {
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

        this.#query_timeout_ms =
            opts.query_timeout_ms ?? this.#query_timeout_ms;

        if (
            !Number.isInteger(this.#query_timeout_ms) ||
            this.#query_timeout_ms <= 0
        ) {
            const err = new DiceDBCommandError(
                'conn_timeout_ms must be an integer!',
            );
            this.logger.error(err);

            throw err;
        }

        this.conn = opts.conn;
        this.client_id = opts.client_id;
        this.command = this.constructor.command;
    }

    async exec(...args) {
        const msg = encodeCommand({
            cmd: this.command,
            args: args.filter((arg) => arg !== null || arg !== 'undefined'),
        });

        const data = await this.conn.write(msg);

        return { data: responseParser(decodeResponse(data)) };
    }
}
