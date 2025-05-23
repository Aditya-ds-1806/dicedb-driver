import Command from '../../lib/Command';
import {
    validateKey,
    validateTime,
    validateTimestamp,
} from '../../lib/Validators';

import { COMMANDS } from '../constants/commands';

export interface GetAndSetExpiryCommandOptions {
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

    /**
     * Executes the GETEX command to retrieve the value of a key and set its expiry options.
     *
     * @param {string} key - The key whose value will be retrieved.
     * @param opts - The options for setting the expiry.
     * @returns A promise that resolves with the value of the key.
     */
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
