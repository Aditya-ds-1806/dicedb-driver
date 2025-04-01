import Command from '../../lib/Command.ts';
import { COMMANDS } from '../constants/commands.ts';

export default class FlushDBCommand extends Command {
    static get command() {
        return COMMANDS.FLUSHDB;
    }

    async exec() {
        return super.exec();
    }
}
