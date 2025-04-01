import Command from '../../lib/Command.ts';
import { COMMANDS } from '../constants/commands.ts';

export default class UnwatchCommand extends Command {
    static get command() {
        return COMMANDS.UNWATCH;
    }

    async exec(fingerprint: string) {
        return super.exec(fingerprint);
    }
}
