import Command from '../../lib/Command';
import { validateKeys } from '../../lib/Validators';

import { COMMANDS } from '../constants/commands';

export default class DeleteCommand extends Command {
    static get command() {
        return COMMANDS.DEL;
    }

    async exec(...keys: string[]) {
        validateKeys(keys);

        return super.exec(...keys);
    }
}
