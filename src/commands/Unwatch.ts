import Command from '../../lib/Command';
import { COMMANDS } from '../constants/commands';

export default class UnwatchCommand extends Command {
    static get command() {
        return COMMANDS.UNWATCH;
    }

    async exec(fingerprint: string) {
        return super.exec(fingerprint);
    }
}
