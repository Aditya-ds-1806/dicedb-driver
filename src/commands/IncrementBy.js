import Command from '../../lib/Command.js';
import { validateKey, validateInteger } from '../../lib/Validators.js';
import { COMMANDS } from '../constants/commands.js';

export default class IncrementByCommand extends Command {
    static get command() {
        return COMMANDS.INCRBY;
    }

    async exec(...args) {
        const [key, delta] = args;

        validateKey(key);
        validateInteger(delta);

        return super.exec(String(key), String(delta));
    }
}
