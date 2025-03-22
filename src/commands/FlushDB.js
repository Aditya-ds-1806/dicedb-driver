import Command from "../../lib/Command.js";
import { COMMANDS } from "../constants/commands.js";

export default class FlushDBCommand extends Command {
    static get command() {
        return COMMANDS.FLUSHDB;
    }

    async exec() {
        return super.exec();
    }
}
