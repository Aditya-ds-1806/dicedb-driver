import Command from "../../lib/Command.js";
import { COMMANDS } from "../constants/commands.js";

export default class HandshakeCommand extends Command {
    static get command() {
        return COMMANDS.HANDSHAKE;
    }

    async exec(...args) {
        const execMode = args?.[0] ?? 'command';

        if (execMode !== 'command' && execMode !== 'watch') {
            const err = new TypeError('execMode must be one of \'command\' or \'watch\'');
            throw err;
        }

        return super.exec(this.client_id, execMode);
    }
}
