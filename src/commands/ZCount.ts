import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export interface ZCountOptions {
    /**
     * The minimum score to count
     */
    min?: number;
    /**
     * The maximum score to count
     */
    max?: number
}

export default class ZCountCommand extends Command {
    static get command() {
        return COMMANDS.ZCOUNT;
    }
    
    /**
     * Get the count of members in a sorted set with scores between min and max
     * 
     * @param {string} key - The key of the sorted set
     * @param {ZCountOptions} opts - Options specifying the score range
     * @returns Count of members with scores in the range
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
