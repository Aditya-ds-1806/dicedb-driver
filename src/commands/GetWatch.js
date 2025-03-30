import Command from '../../lib/Command.js';
import { validateKey } from '../../lib/Validators.js';
import { COMMANDS } from '../constants/commands.js';

export default class GetWatchCommand extends Command {
    static get command() {
        return COMMANDS.GET_WATCH;
    }

    async exec(...args) {
        const key = args?.[0];
        validateKey(key);

        return super.execWatchable(String(key));
    }
}
