import Command from "../../lib/Command.js";
import { COMMANDS } from "../constants/commands.js";

export default class PingCommand extends Command {
    static get command() {
        return COMMANDS.PING;
    }

    async exec(...args) {
        const message = args?.[0];

        if (message) {
            return super.exec(message);
        }

        return super.exec();
    }
}
