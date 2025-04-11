import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class GetCommand extends Command {
    static get command() {
        return COMMANDS.GET;
    }

    /**
     * Executes the GET command to retrieve the value of a key.
     *
     * @param {string} key - The key whose value will be retrieved.
     * @returns A promise that resolves with the value of the key.
     */
    async exec(key: string) {
        validateKey(key);

        return super.exec(key);
    }
}
