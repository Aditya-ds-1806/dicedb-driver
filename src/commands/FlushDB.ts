import Command from '../../lib/Command';
import { COMMANDS } from '../constants/commands';

export default class FlushDBCommand extends Command {
    static get command() {
        return COMMANDS.FLUSHDB;
    }

    /**
     * Executes the FLUSHDB command to remove all keys from the current database.
     *
     * @returns A promise that resolves when the database is cleared.
     */
    async exec() {
        return super.exec();
    }
}
