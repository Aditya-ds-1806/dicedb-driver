import Command from '../../lib/Command';
import { validateKey, validateKeys } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class ZRemCommand extends Command {
    static get command() {
        return COMMANDS.ZREM;
    }

    /**
     * Remove members from a sorted set
     * 
     * @param {string} key - The key of the sorted set
     * @param {string[]} members - The members to remove from the sorted set
     * @returns The number of members removed from the sorted set
     */
    async exec(key: string, ...members: string[]) {
        validateKey(key);
        validateKeys(members);

        return super.exec(key, ...members);
    }
}
