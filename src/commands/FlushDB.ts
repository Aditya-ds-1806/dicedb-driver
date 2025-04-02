import Command from '../../lib/Command';
import { COMMANDS } from '../constants/commands';

export default class FlushDBCommand extends Command {
    static get command() {
        return COMMANDS.FLUSHDB;
    }

    async exec() {
        return super.exec();
    }
}
