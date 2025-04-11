import { WatchableCommand } from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class GetWatchCommand extends WatchableCommand {
    static get command() {
        return COMMANDS.GET_WATCH;
    }

    /**
     * Executes the GET_WATCH command to retrieve the value of a key and watch it for changes.
     *
     * @param {string} key - The key to retrieve and watch.
     * @returns A promise that resolves to a Node.js Readable Stream
     */
    async exec(key: string) {
        validateKey(key);

        return super.exec(String(key));
    }
}
