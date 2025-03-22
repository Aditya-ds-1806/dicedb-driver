import Command from "../../lib/Command.js";
import { COMMANDS } from "../constants/commands.js";

export default class EchoCommand extends Command {
    static get command() {
        return COMMANDS.ECHO;
    }

    async exec(...args) {
        const message = args?.[0] ?? '';

        return super.exec(message.toString());
    }
}
