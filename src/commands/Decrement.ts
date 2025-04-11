import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';

import { COMMANDS } from '../constants/commands';

export default class DecrementCommand extends Command {
    static get command() {
        return COMMANDS.DECR;
    }

    /**
     * Executes the DECR command to decrement the value of the specified key by 1.
     *
     * @param {string} key - The key whose value will be decremented.
     * @returns A promise that resolves with the result of the command.
     */
    async exec(key: string) {
        validateKey(key);

        return super.exec(key);
    }
}
