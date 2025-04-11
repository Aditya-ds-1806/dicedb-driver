import Command from '../../lib/Command';
import { COMMANDS } from '../constants/commands';

export default class EchoCommand extends Command {
    static get command() {
        return COMMANDS.ECHO;
    }

    /**
     * Executes the ECHO command to return the same message sent to the server.
     *
     * @param {string} [message=''] - The message to be echoed back.
     * @returns A promise that resolves with the echoed message.
     */
    async exec(message: string = '') {
        return super.exec(message);
    }
}
