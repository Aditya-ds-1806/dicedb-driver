import Command from "../../lib/Command.js";
import { validateKey, validateTimestamp } from "../../lib/Validators.js";

import { COMMANDS } from "../constants/commands.js";

export default class ExpireAtCommand extends Command {
    static get command() {
        return COMMANDS.EXPIREAT;
    }

    async exec(...args) {
        const [key, timestamp, condition] = args;

        validateKey(key);
        validateTimestamp(timestamp);

        const allowedConditions = ['NX', 'XX', 'GT', 'LT'];

        if (!allowedConditions.includes(condition)) {
            const err = new TypeError(`condition must be one of ${allowedConditions.join(', ')}!`);
            throw err;
        }

        return super.exec(String(key), String(timestamp), condition);
    }
}
