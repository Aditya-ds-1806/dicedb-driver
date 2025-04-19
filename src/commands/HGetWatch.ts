import { WatchableCommand } from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class HGetWatchCommand extends WatchableCommand {
    static get command() {
        return COMMANDS.HGET_WATCH;
    }

    /**
     * Executes the HGET_WATCH command to retrieve the value of a field in a hash and watch it for changes.
     *
     * @param {string} key - The key of the hash.
     * @param {string} field - The field to retrieve and watch.
     * @returns A promise that resolves to a Node.js Readable Stream
     */
    async exec(key: string, field: string) {
        validateKey(key);
        validateKey(field);

        return super.exec(key, field);
    }
}
