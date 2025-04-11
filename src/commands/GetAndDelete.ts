import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class GetAndDeleteCommand extends Command {
    static get command() {
        return COMMANDS.GETDEL;
    }

    /**
     * Executes the GETDEL command to retrieve and delete the value of a key.
     *
     * @param {string} key - The key whose value will be retrieved and deleted.
     * @returns A promise that resolves with the value of the key before deletion.
     */
    async exec(key: string) {
        validateKey(key);

        return super.exec(key);
    }
}
