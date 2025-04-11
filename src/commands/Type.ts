import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class TypeCommand extends Command {
    static get command() {
        return COMMANDS.TYPE;
    }

    /**
     * Executes the TYPE command to get the data type of a key.
     *
     * @param {string} key - The key to check the data type for.
     * @returns A promise that resolves with the data type of the key.
     */
    async exec(key: string) {
        validateKey(key);

        return super.exec(String(key));
    }
}
