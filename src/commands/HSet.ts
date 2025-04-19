import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class HSetCommand extends Command {
    static get command() {
        return COMMANDS.HSET;
    }

    /**
     * Executes the HSET command to set the value of a field in a hash stored at key.
     *
     * @param {string} key - The key of the hash.
     * @param {Record<string, number | string> | Map<string, number | string>} map - An object representing field-value pairs to set in the hash.
     * @returns A promise that resolves with the result of the command execution.
     */
    async exec(key: string, map: Record<string, number | string> | Map<string, number | string>) {
        validateKey(key);
        const keyValuePairs = map instanceof Map ? [...map.entries()].flat() : Object.entries(map).flat();

        return super.exec(key, ...keyValuePairs);
    }
}
