import { ConnectionPool } from '../lib/ConnectionPool';
import CommandRegistry from './registry';
import Logger from '../utils/Logger';
import {
    COMMAND_TO_COMMAND_NAME,
    CONN_TIMEOUT_MS,
    IDLE_TIMEOUT_MS,
    QUERY_TIMEOUT_MS,
} from './constants/commands';
import {
    DiceDBError,
    DiceDBCommandError,
    DiceDBConnectionError,
} from '../lib/Errors';
import { uuid } from '../utils/index';

export interface DiceDBOptions {
    host: string;
    port: number;
    client_id?: string;
    max_pool_size?: number;
    query_timeout_ms?: number;
    conn_timeout_ms?: number;
    idle_timeout_ms?: number;
}

/**
 * The DiceDB class provides an interface to interact with the DiceDB server.
 * It manages the connection pool, command execution, and client configuration.
 *
 * Usage:
 * ```typescript
 * const db = new DiceDB({ host: 'localhost', port: 6379 });
 * await db.connect();
 * await db.set('name', 'Aditya');
 * await db.get('name'); // Aditya
 * ```
 */
export default class DiceDB {
    private queryTimeoutMS: number = QUERY_TIMEOUT_MS;
    private connTimeoutMS: number = CONN_TIMEOUT_MS;
    private idleTimeoutMS: number = IDLE_TIMEOUT_MS;

    private client_id!: string;
    private connectionPool!: ConnectionPool;
    private logger!: Logger;

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
        } = opts ?? {};

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

    /**
     * Connects to the DiceDB server using the connection pool.
     * @returns A promise that resolves when the connection is established.
     */
    async connect(): Promise<void> {
        try {
            await this.connectionPool.connect();
        } catch (err: any) {
            this.logger.error(err);
            throw err;
        }
    }

    /**
     * Executes a command on the DiceDB server.
     * @param command - The command to execute.
     * @param args - The arguments for the command.
     * @returns The result of the command execution.
     * @throws DiceDBError if the command execution fails.
     */
    async execCommand(
        command: keyof typeof COMMAND_TO_COMMAND_NAME,
        ...args: any[]
    ) {
        if (!CommandRegistry.has(command)) {
            throw new DiceDBCommandError({
                message: `unknown command "${command}"`
            })
        }

        const Command = CommandRegistry.get(command)!;

        try {
            const conn = await this.connectionPool.acquireConnection({
                watchable: Command.watchable,
            });

            const cmd = new Command({
                conn,
                client_id: this.client_id,
            });

            return cmd.exec(...args);
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

    /**
     * Disconnects from the DiceDB server and releases all connections.
     * @returns A promise that resolves to true if all connections are successfully released.
     */
    async disconnect(): Promise<boolean> {
        const result = await this.connectionPool.disconnect();
        return result.every(res => res);
    }
}
