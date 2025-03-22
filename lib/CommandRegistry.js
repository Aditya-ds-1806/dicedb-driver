import fs from 'node:fs/promises';
import path from 'node:path'

import Command from "./Command.js";

class CommandRegistry {
    #registry;

    constructor() {
        this.#registry = new Map();
    }

    register(commandName, commandClass) {
        commandName = commandName.toUpperCase();

        if (!commandName) {
            throw new Error('commandName is required!');
        }

        if (!commandClass || !(commandClass.prototype instanceof Command)) {
            throw new Error('commandClass is required and must extend Command');
        }

        if (this.#registry.has(commandName)) {
            throw new Error(`Command ${commandName} has already been registered`);
        }

        this.#registry.set(commandName, commandClass);
    }

    get(commandName) {
        commandName = commandName.toUpperCase();

        if (!this.#registry.has(commandName)) {
            throw new Error(`Command ${commandName} not registered in registry`);
        }

        return this.#registry.get(commandName);
    }

    list() {
        return Array.from(this.#registry.keys());
    }

    async loadCommands(dirPath) {
        const fileNames = await fs.readdir(dirPath);
        const imports = await Promise.all(fileNames.map(fileName => import(path.join(dirPath, fileName))));

        imports.forEach(({ default: Command }, idx) => {
            this.register(Command.command, Command);
        });
    }
}

const commandRegistry = new CommandRegistry();

export default commandRegistry;
