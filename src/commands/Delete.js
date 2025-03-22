import Command from "../../lib/Command.js";
import { validateKeys } from "../../lib/Validators.js";

import { COMMANDS } from "../constants/commands.js";

export default class DeleteCommand extends Command {
    static get command() {
        return COMMANDS.DEL;
    }

    async exec(...args) {
        validateKeys(args);

        return super.exec(...args);
    }
}
