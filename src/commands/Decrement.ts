import Command from '../../lib/Command.ts';
import { validateKey } from '../../lib/Validators.ts';

import { COMMANDS } from '../constants/commands.ts';

export default class DecrementCommand extends Command {
    static get command() {
        return COMMANDS.DECR;
    }

    async exec(key: string) {
        validateKey(key);

        return super.exec(key);
    }
}
