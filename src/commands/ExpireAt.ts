import Command from '../../lib/Command';
import { DiceDBCommandError } from '../../lib/Errors';
import { validateKey, validateTimestamp } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class ExpireAtCommand extends Command {
    static get command() {
        return COMMANDS.EXPIREAT;
    }

    /**
     * Executes the EXPIREAT command to set a timeout on a key at a specific timestamp.
     *
     * @param {string} key - The key to set the timeout on.
     * @param {number} timestamp - The Unix timestamp at which the key will expire.
     * @param condition - The condition for setting the timeout.
     * @returns A promise that resolves with a boolean indicating if the timeout was set.
     */
    async exec(key: string, timestamp: number, condition?: 'NX' | 'XX' | 'GT' | 'LT') {
        validateKey(key);
        validateTimestamp(timestamp);

        const args = [key, String(timestamp)];

        if (condition !== undefined) {
            const allowedConditions = ['NX', 'XX', 'GT', 'LT'];
            if (!allowedConditions.includes(condition)) {
                throw new DiceDBCommandError({
                    message: `${this.command} condition must be one of ${allowedConditions.join(', ')}!`,
                });
            }
            args.push(condition);
        }

        return super.exec(...args);
    }
}
