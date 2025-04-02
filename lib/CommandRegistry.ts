import fs from 'node:fs/promises';
import path from 'node:path';

import Command from './Command';
import { DiceDBCommandError } from './Errors';
import { COMMAND_TO_COMMAND_NAME } from '../src/constants/commands';

type CommandName = keyof typeof COMMAND_TO_COMMAND_NAME;

class CommandRegistry {
    private registry: Map<CommandName, typeof Command> = new Map();

    register(commandName: CommandName, commandClass: typeof Command): void {
        commandName = commandName.toUpperCase() as CommandName;

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

        if (this.registry.has(commandName)) {
            throw new DiceDBCommandError({
                message: `Command ${commandName} has already been registered`,
            });
        }

        this.registry.set(commandName, commandClass);
    }

    get(commandName: CommandName): typeof Command {
        commandName = commandName.toUpperCase() as CommandName;

        if (!this.registry.has(commandName)) {
            throw new DiceDBCommandError({
                message: `Command ${commandName} not registered in registry`,
            });
        }

        return this.registry.get(commandName)!;
    }

    list() {
        return Array.from(this.registry.keys());
    }

    async loadCommands(dirPath: string): Promise<void> {
        const fileNames = await fs.readdir(dirPath);
        const imports = await Promise.all(
            fileNames.map((fileName) => import(path.join(dirPath, fileName))),
        );

        imports.forEach(({ default: CommandClass }) => {
            if (CommandClass && typeof CommandClass.command === 'string') {
                this.register(CommandClass.command, CommandClass);
            }
        });
    }
}

const commandRegistry = new CommandRegistry();

export default commandRegistry;
