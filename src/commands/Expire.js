import Command from "../../lib/Command.js";
import { validateKey, validateTime } from "../../lib/Validators.js";
import { COMMANDS } from "../constants/commands.js";

export default class ExpireCommand extends Command {
    static get command() {
        return COMMANDS.EXPIRE;
    }

    async exec(...args) {
        const [key, seconds, condition] = args;

        validateKey(key);
        validateTime(seconds);

        const allowedConditions = ['NX', 'XX'];

        if (!allowedConditions.includes(condition)) {
            const err = new TypeError(`condition must be one of ${allowedConditions.join(', ')}!`);
            throw err;
        }

        return super.exec(String(key), String(seconds), condition);
    }
}
