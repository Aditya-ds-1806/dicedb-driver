import Command from '../../lib/Command.js';
import { COMMANDS } from '../constants/commands.js';

export default class UnwatchCommand extends Command {
    static get command() {
        return COMMANDS.UNWATCH;
    }

    async exec(...args) {
        const fingerprint = args?.[0];

        return super.exec(fingerprint);
    }
}
