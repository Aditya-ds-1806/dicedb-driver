import Command from '../../lib/Command.ts';
import { DiceDBCommandError } from '../../lib/Errors.ts';
import { validateKey, validateTime } from '../../lib/Validators.ts';
import { COMMANDS } from '../constants/commands.ts';

export default class ExpireCommand extends Command {
    static get command() {
        return COMMANDS.EXPIRE;
    }

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
