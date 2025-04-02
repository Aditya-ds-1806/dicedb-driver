import Command from '../../lib/Command';
import { DiceDBCommandError } from '../../lib/Errors';
import { validateKey, validateTimestamp } from '../../lib/Validators';

import { COMMANDS } from '../constants/commands';

export default class ExpireAtCommand extends Command {
    static get command() {
        return COMMANDS.EXPIREAT;
    }

    async exec(
        key: string,
        timestamp: number,
        condition: 'NX' | 'XX' | 'GT' | 'LT',
    ) {
        validateKey(key);
        validateTimestamp(timestamp);

        const allowedConditions = ['NX', 'XX', 'GT', 'LT'];

        if (!allowedConditions.includes(condition)) {
            const err = new DiceDBCommandError({
                message: `${this.command} condition must be one of ${allowedConditions.join(', ')}!`,
            });

            throw err;
        }

        return super.exec(key, timestamp, condition);
    }
}
