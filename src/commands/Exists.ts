import Command from '../../lib/Command';
import { validateKeys } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class ExistsCommand extends Command {
    static get command() {
        return COMMANDS.EXISTS;
    }

    /**
     * Executes the EXISTS command to check if one or more keys exist.
     *
     * @param {...string} keys - The keys to check for existence.
     * @returns A promise that resolves with the number of keys that exist.
     */
    async exec(...keys: string[]) {
        validateKeys(keys);
        const uniqueKeys = new Set(keys.map(String));

        return super.exec(...uniqueKeys);
    }
}
