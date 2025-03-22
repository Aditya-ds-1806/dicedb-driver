import Command from '../../lib/Command.js';
import {
    validateKey,
    validateTime,
    validateTimestamp,
} from '../../lib/Validators.js';

import { COMMANDS } from '../constants/commands.js';

export default class GetAndSetExpiryCommand extends Command {
    static get command() {
        return COMMANDS.GETEX;
    }

    async exec(...args) {
        const [key, opts = {}] = args;
        validateKey(key);

        const { ex, px, ex_at: exAt, px_at: pxAt, persist = false } = opts;
        const cmdArgs = [String(key)];

        if (ex >= 0 && validateTime(ex)) {
            cmdArgs.push('EX', String(ex));
        } else if (px >= 0 && validateTime(px)) {
            cmdArgs.push('PX', String(px));
        } else if (exAt >= 0 && validateTimestamp(exAt)) {
            cmdArgs.push('EXAT', String(exAt));
        } else if (pxAt >= 0 && validateTimestamp(pxAt)) {
            cmdArgs.push('PXAT', String(pxAt));
        } else if (typeof persist === 'boolean' && persist) {
            cmdArgs.push('PERSIST');
        }

        return super.exec(...cmdArgs);
    }
}
