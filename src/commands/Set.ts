import Command from '../../lib/Command';
import {
    validateKey,
    validateSetValue,
    validateTime,
    validateTimestamp,
} from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export interface SetCommandOptions {
    ex?: number;
    px?: number;
    ex_at?: number;
    px_at?: number;
    xx?: boolean;
    nx?: boolean;
    keepTTL?: boolean;
}

export default class SetCommand extends Command {
    static get command() {
        return COMMANDS.SET;
    }

    /**
     * Executes the SET command to set the value of a key with optional expiry options.
     *
     * @param {string} key - The key to set the value for.
     * @param {string | number} value - The value to set for the key.
     * @param opts - The options for setting the key, such as expiry time.
     * @returns A promise that resolves when the key is set successfully.
     */
    async exec(
        key: string,
        value: string | number,
        opts: SetCommandOptions = {},
    ) {
        validateKey(key);
        validateSetValue(value);

        const {
            ex,
            px,
            ex_at: exAt,
            px_at: pxAt,
            xx = false,
            nx = false,
            keepTTL = false,
        } = opts;

        const cmdArgs = [key, value];

        if (ex !== undefined && ex >= 0 && validateTime(ex)) {
            cmdArgs.push('EX', String(ex));
        } else if (px !== undefined && px >= 0 && validateTime(px)) {
            cmdArgs.push('PX', String(px));
        } else if (exAt !== undefined && exAt >= 0 && validateTimestamp(exAt)) {
            cmdArgs.push('EXAT', String(exAt));
        } else if (pxAt !== undefined && pxAt >= 0 && validateTimestamp(pxAt)) {
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
