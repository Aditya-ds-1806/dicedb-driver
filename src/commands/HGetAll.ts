import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { HElement } from '../../proto/res_pb';
import { COMMANDS } from '../constants/commands';

export default class HGetAllCommand extends Command {
    static get command() {
        return COMMANDS.HGETALL;
    }

    /**
     * Executes the HGETALL command to retrieve the value of a field in a hash stored at a key.
     *
     * @param {string} key - The key of the hash.
     * @returns A promise that resolves with the value of the field, or null if the field does not exist.
     */
    async exec(key: string) {
        validateKey(key);

        const response = await super.exec(key);

        response.data.result = response.data.result.reduce((map: Map<string, string>, entry: HElement) => {
            map.set(entry.key, entry.value);
            return map;
        }, new Map());

        return response;
    }
}
