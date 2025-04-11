import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class IncrementCommand extends Command {
    static get command() {
        return COMMANDS.INCR;
    }

    /**
     * Executes the INCR command to increment the value of a key by 1.
     *
     * @param {string} key - The key whose value will be incremented.
     * @returns A promise that resolves with the new value of the key.
     */
    async exec(key: string) {
        validateKey(key);

        return super.exec(key);
    }
}
