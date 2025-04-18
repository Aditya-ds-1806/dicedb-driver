import Command from '../../lib/Command';
import { COMMANDS } from '../constants/commands';

export default class PingCommand extends Command {
    static get command() {
        return COMMANDS.PING;
    }

    /**
     * Executes the PING command to test the connection to the server.
     *
     * @param {string} [message] - An optional message to send with the PING command.
     * @returns A promise that resolves with the server's response.
     */
    async exec(message?: string) {
        return super.exec(message);
    }
}
