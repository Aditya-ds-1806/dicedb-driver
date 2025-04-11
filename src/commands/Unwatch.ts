import Command from '../../lib/Command';
import { COMMANDS } from '../constants/commands';

export default class UnwatchCommand extends Command {
    static get command() {
        return COMMANDS.UNWATCH;
    }

    /**
     * Executes the UNWATCH command to remove all watched keys for the current connection.
     *
     * @param {string} fingerprint - The unique identifier for the connection.
     * @returns A promise that resolves when the keys are unwatched.
     */
    async exec(fingerprint: string) {
        return super.exec(fingerprint);
    }
}
