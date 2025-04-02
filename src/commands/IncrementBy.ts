import Command from '../../lib/Command';
import { validateKey, validateInteger } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

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
