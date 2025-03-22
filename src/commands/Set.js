import Command from "../../lib/Command.js";
import { validateKey, validateSetValue, validateTime, validateTimestamp } from "../../lib/Validators.js";
import { COMMANDS } from "../constants/commands.js";

export default class SetCommand extends Command {
    static get command() {
        return COMMANDS.SET;
    }

    async exec(...args) {
        const [key, value, opts = {}] = args;

        validateKey(key);
        validateSetValue(value);

        const {
            ex,
            px,
            ex_at: exAt,
            px_at: pxAt,
            xx = false,
            nx = false,
            keepTTL = false
        } = opts;

        const cmdArgs = [String(key), String(value)];

        if (ex >= 0 && validateTime(ex)) {
            cmdArgs.push('EX', String(ex));
        } else if (px >= 0 && validateTime(px)) {
            cmdArgs.push('PX', String(px));
        } else if (exAt >= 0 && validateTimestamp(exAt)) {
            cmdArgs.push('EXAT', String(exAt));
        } else if (pxAt >= 0 && validateTimestamp(pxAt)) {
            cmdArgs.push('PXAT', String(pxAt));
        } else if (keepTTL) {
            cmdArgs.push('KEEPTTL');
        }

        if (typeof xx === 'boolean' && xx) {
            cmdArgs.push('XX');
        } else if (typeof nx === 'boolean' && nx) {
            cmdArgs.push('NX');
        }

        return super.exec(...cmdArgs);
    }
}
