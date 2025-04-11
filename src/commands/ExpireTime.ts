import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class ExpireTimeCommand extends Command {
    static get command() {
        return COMMANDS.EXPIRETIME;
    }

    /**
     * Executes the EXPIRETIME command to get the expiration time of a key.
     *
     * @param {string} key - The key to check the expiration time for.
     * @returns A promise that resolves with the expiration time of the key.
     */
    async exec(key: string) {
        validateKey(key);

        return super.exec(key);
    }
}
