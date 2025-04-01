import Command from '../../lib/Command.ts';
import { validateKeys } from '../../lib/Validators.ts';

import { COMMANDS } from '../constants/commands.ts';

export default class DeleteCommand extends Command {
    static get command() {
        return COMMANDS.DEL;
    }

    async exec(...keys: string[]) {
        validateKeys(keys);

        return super.exec(...keys);
    }
}
