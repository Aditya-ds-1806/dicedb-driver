import Command from '../../lib/Command';
import { validateKey, validateSetValue } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class GetSetCommand extends Command {
    static get command() {
        return COMMANDS.GETSET;
    }

    /**
     * Executes the GETSET command to set and get the old value of a key.
     *
     * @param {string} key - The key whose old value will be retrieved.
     * @param {number | string} value - The value to set.
     * @returns A promise that resolves with the old value of the key.
     */
    async exec(key: string, value: number | string) {
        validateKey(key);
        validateSetValue(value);

        return super.exec(key, value);
    }
}
