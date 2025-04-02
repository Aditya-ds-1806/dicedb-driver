import Command from '../../lib/Command';
import { DiceDBCommandError } from '../../lib/Errors';
import { COMMANDS } from '../constants/commands';

export default class HandshakeCommand extends Command {
    static get command() {
        return COMMANDS.HANDSHAKE;
    }

    static get is_private() {
        return true;
    }

    async exec(execMode: 'command' | 'watch') {
        if (execMode !== 'command' && execMode !== 'watch') {
            const err = new DiceDBCommandError({
                message: `${this.command} execMode must be one of 'command' or 'watch'`,
            });

            throw err;
        }

        return super.exec(this.client_id, execMode);
    }
}
