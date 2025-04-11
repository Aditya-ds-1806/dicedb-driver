import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class TTLCommand extends Command {
    static get command() {
        return COMMANDS.TTL;
    }

    /**
     * Executes the TTL command to get the remaining time to live of a key.
     *
     * @param {string} key - The key to check the TTL for.
     * @returns A promise that resolves with the TTL of the key in seconds.
     */
    async exec(key: string) {
        validateKey(key);

        return super.exec(String(key));
    }
}
