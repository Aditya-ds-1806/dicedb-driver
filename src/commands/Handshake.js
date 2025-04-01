import Command from '../../lib/Command.js';
import { DiceDBCommandError } from '../../lib/Errors.js';
import { COMMANDS } from '../constants/commands.js';

export default class HandshakeCommand extends Command {
    static get command() {
        return COMMANDS.HANDSHAKE;
    }

    static get is_private() {
        return true;
    }

    async exec(...args) {
        const execMode = args?.[0] ?? 'command';

        if (execMode !== 'command' && execMode !== 'watch') {
            const err = new DiceDBCommandError(
                `${this.command} execMode must be one of 'command' or 'watch'`,
            );
            throw err;
        }

        return super.exec(this.client_id, execMode);
    }
}
