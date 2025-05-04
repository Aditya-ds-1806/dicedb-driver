import { Readable } from 'stream';
import EventEmitter from 'events';
import { create, fromBinary, toBinary } from '@bufbuild/protobuf';

import { CommandSchema } from '../proto/cmd_pb';
import { ResultSchema } from '../proto/res_pb';
import { uuid } from '../utils/index';
import { DiceDBCommandError } from './Errors';
import { responseParser } from './Parsers';
import { DiceDBSocket } from './DiceDBSocket';

import type { DiceDBResponse } from './Parsers';

export interface CommandOptions {
    conn: DiceDBSocket;
    client_id: string;
}

export default class Command<T = DiceDBResponse> extends EventEmitter {
    protected conn!: DiceDBSocket;
    protected client_id!: string;
    protected query_id!: string;
    protected command!: string;

    constructor(opts: CommandOptions) {
        super();
        this.init(opts);
    }

    private BYTE_LENGTH_PREFIX_LEN = 4

    private init(opts: CommandOptions): void {
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
            throw new DiceDBCommandError({ message: 'client_id is required!' });
        }

        if (
            typeof (this.constructor as typeof Command).command !== 'string' ||
            (this.constructor as typeof Command).command === ''
        ) {
            throw new DiceDBCommandError({
                message: 'command getter must be specified!',
            });
        }

        this.conn = opts.conn;
        this.client_id = opts.client_id;
        this.query_id = uuid('qid_');
        this.command = (this.constructor as typeof Command).command;
    }

    prefixMsgWithByteLength(msg: Uint8Array<ArrayBufferLike>) {
        const byteLenPrefixBuffer = new ArrayBuffer(this.BYTE_LENGTH_PREFIX_LEN);
        const view = new DataView(byteLenPrefixBuffer);
        view.setUint32(0, msg.byteLength, false); // big-endian value

        const byteLenPrefixMsg = new Uint8Array(byteLenPrefixBuffer);
        const finalMsg = new Uint8Array(this.BYTE_LENGTH_PREFIX_LEN + msg.byteLength);

        finalMsg.set(byteLenPrefixMsg, 0);
        finalMsg.set(msg, byteLenPrefixMsg.byteLength);

        return finalMsg;
    }

    decodeByteLengthPrefixedMsg(msg: Uint8Array) {
        const msgLength = new DataView(msg.buffer, msg.byteOffset, 4).getUint32(0);
        const message = msg.slice(this.BYTE_LENGTH_PREFIX_LEN, this.BYTE_LENGTH_PREFIX_LEN + msgLength);
        
        return message
    }

    static get watchable(): boolean {
        return false;
    }

    static get is_private(): boolean {
        return false;
    }

    static get command(): string {
        return '';
    }

    async exec(...args: any[]): Promise<T> {
        const cmdArgs = args
            .filter((arg) => arg !== null && arg !== undefined)
            .map(String);

        const msg = toBinary(
            CommandSchema,
            create(CommandSchema, {
                cmd: this.command,
                args: cmdArgs,
            }),
        );

        const data = await this.conn.write(this.prefixMsgWithByteLength(msg));
        const response = responseParser(fromBinary(ResultSchema, this.decodeByteLengthPrefixedMsg(data)));

        Object.assign(response.data.meta, {
            watch: (this.constructor as typeof Command).watchable,
            command: this.command,
            args: cmdArgs,
            client_id: this.client_id,
            query_id: this.query_id,
            socket_id: this.conn.socket_id,
        });

        return response as T;
    }
}

export class WatchableCommand extends Command<Readable> {
    static get watchable(): boolean {
        return true;
    }

    async exec(...args: any[]) {
        if (!this.conn.subscribe) {
            throw new DiceDBCommandError({
                message: 'Connection does not support subscribe',
            });
        }

        const cmdArgs = args
            .filter((arg) => arg !== null && arg !== undefined)
            .map(String);

        const msg = toBinary(
            CommandSchema,
            create(CommandSchema, {
                cmd: this.command,
                args: cmdArgs,
            }),
        );

        const socket = this.conn.subscribe(this.prefixMsgWithByteLength(msg));
        const readable = new Readable({ read() {}, objectMode: true });

        socket.on('error', (err) => readable.destroy(err));
        socket.on('data', (data) => {
            const decodedData = responseParser(
                fromBinary(ResultSchema, this.decodeByteLengthPrefixedMsg(data)),
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
