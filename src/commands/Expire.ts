import Command from '../../lib/Command';
import { DiceDBCommandError } from '../../lib/Errors';
import { validateKey, validateTime } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class ExpireCommand extends Command {
    static get command() {
        return COMMANDS.EXPIRE;
    }

    /**
     * Executes the EXPIRE command to set a timeout on a key.
     *
     * @param {string} key - The key to set the timeout on.
     * @param {number} seconds - The timeout duration in seconds.
     * @param condition - The condition for setting the timeout.
     * @returns A promise that resolves with the result of the command.
     */
    async exec(key: string, seconds: number, condition: 'NX' | 'XX') {
        validateKey(key);
        validateTime(seconds);

        const allowedConditions = ['NX', 'XX'];

        if (!allowedConditions.includes(condition)) {
            const err = new DiceDBCommandError({
                message: `${this.command} condition must be one of ${allowedConditions.join(', ')}!`,
            });

            throw err;
        }

        return super.exec(key, seconds, condition);
    }
}
