import { WatchableCommand } from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class ZCardWatchCommand extends WatchableCommand {
    static get command() {
        return COMMANDS.ZCARD_WATCH;
    }

    /**
     * Executes the ZCARD.WATCH command to retrieve the number of members in a sorted set.
     * 
     * @param {string} key - The key of the sorted set
     * @returns The number of members in the sorted set
     */
    async exec(key: string) {
        validateKey(key);
        return super.exec(key);
    }
}
