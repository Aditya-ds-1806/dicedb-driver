import Command from '../../lib/Command.ts';
import {
    validateKey,
    validateTime,
    validateTimestamp,
} from '../../lib/Validators.ts';

import { COMMANDS } from '../constants/commands.ts';

interface GetAndSetExpiryCommandOptions {
    ex?: number;
    px?: number;
    ex_at?: number;
    px_at?: number;
    persist?: boolean;
}

export default class GetAndSetExpiryCommand extends Command {
    static get command() {
        return COMMANDS.GETEX;
    }

    async exec(key: string, opts: GetAndSetExpiryCommandOptions = {}) {
        validateKey(key);

        const { ex, px, ex_at: exAt, px_at: pxAt, persist = false } = opts;
        const cmdArgs: (string | number)[] = [key];

        if (ex !== undefined && ex >= 0 && validateTime(ex)) {
            cmdArgs.push('EX', ex);
        } else if (px !== undefined && px >= 0 && validateTime(px)) {
            cmdArgs.push('PX', px);
        } else if (exAt !== undefined && exAt >= 0 && validateTimestamp(exAt)) {
            cmdArgs.push('EXAT', exAt);
        } else if (pxAt !== undefined && pxAt >= 0 && validateTimestamp(pxAt)) {
            cmdArgs.push('PXAT', pxAt);
        } else if (typeof persist === 'boolean' && persist) {
            cmdArgs.push('PERSIST');
        }

        return super.exec(...cmdArgs);
    }
}
