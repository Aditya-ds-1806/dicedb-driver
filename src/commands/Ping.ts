import Command from '../../lib/Command';
import { COMMANDS } from '../constants/commands';

export default class PingCommand extends Command {
    static get command() {
        return COMMANDS.PING;
    }

    async exec(message: string) {
        if (message) {
            return super.exec(message);
        }

        return super.exec();
    }
}
