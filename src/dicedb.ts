import path from 'node:path';

import { ConnectionPool } from '../lib/ConnectionPool.ts';
import CommandRegistry from '../lib/CommandRegistry.ts';
import Logger from '../utils/Logger.ts';
import {
    COMMAND_TO_COMMAND_NAME,
    CONN_TIMEOUT_MS,
    IDLE_TIMEOUT_MS,
    QUERY_TIMEOUT_MS,
} from './constants/commands.ts';
import {
    DiceDBError,
    DiceDBCommandError,
    DiceDBConnectionError,
} from '../lib/Errors.ts';
import { uuid } from '../utils/index.ts';
import Command from '../lib/Command.ts';

interface DiceDBOptions {
    host: string;
    port: number;
    client_id?: string;
    max_pool_size?: number;
    query_timeout_ms?: number;
    conn_timeout_ms?: number;
    idle_timeout_ms?: number;
}

export default class DiceDB {
    private queryTimeoutMS: number = QUERY_TIMEOUT_MS;
    private connTimeoutMS: number = CONN_TIMEOUT_MS;
    private idleTimeoutMS: number = IDLE_TIMEOUT_MS;

    private client_id!: string;
    private connectionPool!: ConnectionPool;
    private logger!: Logger;

    private static commandsAttached: boolean = false;

    constructor(opts: DiceDBOptions) {
        this.init(opts);
    }

    private init(opts: DiceDBOptions): void {
        const {
            host,
            port,
            client_id: clientId,
            max_pool_size: maxPoolSize,
            query_timeout_ms: queryTimeoutMS,
            conn_timeout_ms: connTimeoutMS,
            idle_timeout_ms: idleTimeoutMS,
        } = opts;

        this.logger = new Logger('DiceDB');

        if (!host) {
            const err = new DiceDBError({ message: 'Host is required!' });
            this.logger.error(err);
            throw err;
        }

        if (!Number.isInteger(port) || port <= 0) {
            const err = new DiceDBError({
                message: 'Port is required and must be an integer!',
            });
            this.logger.error(err);
            throw err;
        }

        this.queryTimeoutMS = queryTimeoutMS ?? this.queryTimeoutMS;
        this.connTimeoutMS = connTimeoutMS ?? this.connTimeoutMS;
        this.idleTimeoutMS = idleTimeoutMS ?? this.idleTimeoutMS;

        if (
            !Number.isInteger(this.queryTimeoutMS) ||
            this.queryTimeoutMS <= 0
        ) {
            const err = new DiceDBError({
                message: 'query_timeout_ms must be an integer!',
            });
            this.logger.error(err);
            throw err;
        }

        if (!Number.isInteger(this.connTimeoutMS) || this.connTimeoutMS <= 0) {
            const err = new DiceDBError({
                message: 'conn_timeout_ms must be an integer!',
            });
            this.logger.error(err);
            throw err;
        }

        if (!Number.isInteger(this.idleTimeoutMS) || this.idleTimeoutMS <= 0) {
            const err = new DiceDBError({
                message: 'idle_timeout_ms must be an integer!',
            });
            this.logger.error(err);
            throw err;
        }

        this.client_id = clientId ?? uuid('cid_');

        this.connectionPool = new ConnectionPool({
            port,
            host,
            client_id: this.client_id,
            max_pool_size: maxPoolSize,
            conn_timeout_ms: this.connTimeoutMS,
            query_timeout_ms: this.queryTimeoutMS,
            idle_timeout_ms: this.idleTimeoutMS,
        });

        this.logger.info(`Initialized DiceDB client ${this.client_id}`);
    }

    async connect(): Promise<void> {
        try {
            await DiceDB.attachCommands();
            await this.connectionPool.connect();
        } catch (err: any) {
            this.logger.error(err);
            throw err;
        }
    }

    async execCommand(
        CommandClass: typeof Command,
        ...args: any[]
    ): Promise<any> {
        try {
            const conn = await this.connectionPool.acquireConnection({
                watchable: CommandClass.watchable,
            });

            const cmd = new CommandClass({
                conn,
                client_id: this.client_id,
            });

            return await cmd.exec(...args);
        } catch (err) {
            if (err instanceof DiceDBConnectionError) {
                throw new DiceDBError({
                    message:
                        'Failed to execute command, did you forget to call connect()?',
                    cause: err,
                });
            } else if (err instanceof DiceDBCommandError) {
                throw new DiceDBError({
                    message: 'Failed to execute command',
                    cause: err,
                });
            } else {
                throw err;
            }
        }
    }

    private static async attachCommands(): Promise<void> {
        if (DiceDB.commandsAttached) {
            return;
        }

        await CommandRegistry.loadCommands(
            path.resolve(import.meta.dirname, '../src/commands'),
        );

        CommandRegistry.list().forEach((command) => {
            const commandName = COMMAND_TO_COMMAND_NAME[command];
            const Command = CommandRegistry.get(command);

            if (Command.is_private) {
                return;
            }

            (DiceDB as any).prototype[commandName] = async function (
                ...args: any[]
            ) {
                return this.execCommand(Command, ...args);
            };
        });

        DiceDB.commandsAttached = true;
    }
}
