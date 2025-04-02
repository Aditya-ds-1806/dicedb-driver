import Command from '../../lib/Command';
import { COMMANDS } from '../constants/commands';

export default class EchoCommand extends Command {
    static get command() {
        return COMMANDS.ECHO;
    }

    async exec(message: string) {
        return super.exec(message);
    }
}
