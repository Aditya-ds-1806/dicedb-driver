import Command from '../../lib/Command';
import { validateKeys } from '../../lib/Validators';

import { COMMANDS } from '../constants/commands';

export default class DeleteCommand extends Command {
    static get command() {
        return COMMANDS.DEL;
    }

    /**
     * Executes the DEL command to delete one or more keys.
     *
     * @param {...string} keys - The keys to be deleted.
     * @returns A promise that resolves with the result of the command.
     */
    async exec(...keys: string[]) {
        validateKeys(keys);

        return super.exec(...keys);
    }
}
