import Command from '../../lib/Command.ts';
import { validateKey, validateInteger } from '../../lib/Validators.ts';
import { COMMANDS } from '../constants/commands.ts';

export default class IncrementByCommand extends Command {
    static get command() {
        return COMMANDS.INCRBY;
    }

    async exec(key: string, delta: number) {
        validateKey(key);
        validateInteger(delta);

        return super.exec(key, delta);
    }
}
