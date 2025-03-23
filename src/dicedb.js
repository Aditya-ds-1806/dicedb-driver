import path from 'node:path';

import { ConnectionPool } from '../lib/ConnectionPool.js';
import CommandRegistry from '../lib/CommandRegistry.js';
import Logger from '../utils/Logger.js';
import {
    COMMAND_TO_COMMAND_NAME,
    COMMANDS,
    CONN_TIMEOUT_MS,
    QUERY_TIMEOUT_MS,
} from './constants/commands.js';
import {
    DiceDBError,
    DiceDBCommandError,
    DiceDBConnectionError,
} from '../lib/Errors.js';
import { uuid } from '../utils/index.js';

export default class DiceDB {
    constructor(opts = {}) {
        this.init(opts);
    }

    #queryTimeoutMS = QUERY_TIMEOUT_MS;
    #connTimeoutMS = CONN_TIMEOUT_MS;

    init(opts = {}) {
        const {
            host,
            port,
            client_id: clientId,
            max_pool_size: maxPoolSize,
            query_timeout_ms: queryTimeoutMS,
            conn_timeout_ms: connTimeoutMS,
        } = opts;

        this.logger = new Logger('DiceDB');

        if (!host) {
            const err = new DiceDBError('Host is required!');
            this.logger.error(err);

            throw err;
        }

        if (!Number.isInteger(port) || port <= 0) {
            const err = new DiceDBError(
                'Port is required and must be an interger!',
            );
            this.logger.error(err);

            throw err;
        }

        this.#queryTimeoutMS = queryTimeoutMS ?? this.#queryTimeoutMS;
        this.#connTimeoutMS = connTimeoutMS ?? this.#connTimeoutMS;

        if (
            !Number.isInteger(this.#queryTimeoutMS) ||
            this.#queryTimeoutMS <= 0
        ) {
            const err = new DiceDBError('query_timeout_ms must be an integer!');
            this.logger.error(err);

            throw err;
        }

        if (
            !Number.isInteger(this.#connTimeoutMS) ||
            this.#connTimeoutMS <= 0
        ) {
            const err = new DiceDBError('conn_timeout_ms must be an integer!');
            this.logger.error(err);

            throw err;
        }

        this.client_id = clientId ?? uuid();

        this.connectionPool = new ConnectionPool({
            port,
            host,
            client_id: this.client_id,
            max_pool_size: maxPoolSize,
            conn_timeout_ms: this.#connTimeoutMS,
        });

        this.logger.info(`Initialized DiceDB client ${this.client_id}`);
    }

    async connect() {
        try {
            await DiceDB.#attachCommands();
            await this.connectionPool.connect();
            const { data } = await this.execCommand(COMMANDS.HANDSHAKE);

            if (data.result !== 'OK') {
                throw new DiceDBConnectionError({
                    message:
                        'Connection succeeded but server handshake failed!',
                });
            }
        } catch (err) {
            this.logger.error(err);
            throw err;
        }
    }

    async execCommand(command, ...args) {
        try {
            const Command = CommandRegistry.get(command);
            const conn = await this.connectionPool.acquireConnection();

            const cmd = new Command({
                conn,
                client_id: this.client_id,
                query_timeout_ms: this.#queryTimeoutMS,
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

    static #commandsAttached = false;

    static async #attachCommands() {
        if (DiceDB.#commandsAttached) {
            return;
        }

        await CommandRegistry.loadCommands(
            path.resolve(import.meta.dirname, '../src/commands'),
        );

        CommandRegistry.list().forEach((command) => {
            const commandName = COMMAND_TO_COMMAND_NAME[command];

            DiceDB.prototype[commandName] = async function (...args) {
                return this.execCommand(command, ...args);
            };
        });

        DiceDB.#commandsAttached = true;
    }
}
