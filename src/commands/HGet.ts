import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class HGetCommand extends Command {
    static get command() {
        return COMMANDS.HGET;
    }

    /**
     * Executes the HGET command to retrieve the value of a field in a hash stored at a key.
     *
     * @param {string} key - The key of the hash.
     * @param {string} fieldName - The field name whose value will be retrieved.
     * @returns A promise that resolves with the value of the field, or null if the field does not exist.
     */
    async exec(key: string, fieldName: string) {
        validateKey(key);

        const value = await super.exec(key, fieldName);

        return value;
    }
}
