import { WatchableCommand } from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';
import { ZCountOptions } from './ZCount';

export default class ZCountWatchCommand extends WatchableCommand {
    static get command() {
        return COMMANDS.ZCOUNT_WATCH;
    }

    /**
     * Executes the ZCOUNT.WATCH command to get the number of members in a sorted set
     * 
     * @param {string} key - The key of the sorted set
     * @param {ZCountOptions} opts - Options specifying the score range
     * @returns The number of members in the sorted set
     */
    async exec(key: string, opts?: ZCountOptions) {
        validateKey(key);

        const args: (string | number)[] = [key];

        opts = opts ?? {};
        opts.min = opts?.min ?? Number.NEGATIVE_INFINITY;
        opts.max = opts?.max ?? Number.POSITIVE_INFINITY;
    
        if (opts.min === Number.NEGATIVE_INFINITY) {
            args.push('-inf');
        } else if (Number.isFinite(opts.min)) {
            args.push(opts.min);
        }

        if (opts.max === Number.POSITIVE_INFINITY) {
            args.push('+inf');
        } else if (Number.isFinite(opts.max)) {
            args.push(opts.max);
        }

        return super.exec(...args);
    }
}
