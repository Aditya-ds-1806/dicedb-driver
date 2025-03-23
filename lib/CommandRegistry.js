import fs from 'node:fs/promises';
import path from 'node:path';

import Command from './Command.js';
import { DiceDBCommandError } from './Errors.js';

class CommandRegistry {
    #registry = new Map();

    register(commandName, commandClass) {
        commandName = commandName.toUpperCase();

        if (!commandName) {
            throw new DiceDBCommandError({
                message: 'commandName is required!',
            });
        }

        if (!commandClass || !(commandClass.prototype instanceof Command)) {
            throw new DiceDBCommandError({
                message: 'commandClass is required and must extend Command',
            });
        }

        if (this.#registry.has(commandName)) {
            throw new DiceDBCommandError({
                message: `Command ${commandName} has already been registered`,
            });
        }

        this.#registry.set(commandName, commandClass);
    }

    get(commandName) {
        commandName = commandName.toUpperCase();

        if (!this.#registry.has(commandName)) {
            throw new DiceDBCommandError({
                message: `Command ${commandName} not registered in registry`,
            });
        }

        return this.#registry.get(commandName);
    }

    list() {
        return Array.from(this.#registry.keys());
    }

    async loadCommands(dirPath) {
        const fileNames = await fs.readdir(dirPath);
        const imports = await Promise.all(
            fileNames.map((fileName) => import(path.join(dirPath, fileName))),
        );

        imports.forEach(({ default: Command }) => {
            this.register(Command.command, Command);
        });
    }
}

const commandRegistry = new CommandRegistry();

export default commandRegistry;
