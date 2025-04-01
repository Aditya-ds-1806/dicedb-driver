import Command from '../../lib/Command.ts';
import { validateKey } from '../../lib/Validators.ts';
import { COMMANDS } from '../constants/commands.ts';

export default class ExpireTimeCommand extends Command {
    static get command() {
        return COMMANDS.EXPIRETIME;
    }

    async exec(key: string) {
        validateKey(key);

        return super.exec(key);
    }
}
