import crypto from 'node:crypto';
import path from 'node:path';

import { ConnectionPool } from '../lib/ConnectionPool.js';
import CommandRegistry from '../lib/CommandRegistry.js';
import Logger from '../utils/Logger.js';
import { COMMAND_TO_COMMAND_NAME } from './constants/commands.js';

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
            max_pool_size: maxPoolSize,
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
            max_pool_size: maxPoolSize,
        });

        this.logger.info(`Initialized DiceDB client ${this.client_id}`);
    }

    async connect() {
        await DiceDB.#attachCommands();

        return this.connectionPool.connect();
    }

    async execCommand(command, ...args) {
        const conn = await this.connectionPool.acquireConnection();
        const Command = CommandRegistry.get(command);

        const cmd = new Command({ conn, client_id: this.client_id });
        const data = await cmd.exec(...args);

        return data;
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
