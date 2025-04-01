import Command from '../../lib/Command.ts';
import { COMMANDS } from '../constants/commands.ts';

export default class EchoCommand extends Command {
    static get command() {
        return COMMANDS.ECHO;
    }

    async exec(message: string) {
        return super.exec(message);
    }
}
