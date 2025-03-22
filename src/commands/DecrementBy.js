import Command from '../../lib/Command.js';
import { validateKey, validateInteger } from '../../lib/Validators.js';
import { COMMANDS } from '../constants/commands.js';

export default class DecrementByCommand extends Command {
    static get command() {
        return COMMANDS.DECRBY;
    }

    async exec(...args) {
        const [key, delta] = args;

        validateKey(key);
        validateInteger(delta);

        return super.exec(String(key), String(delta));
    }
}
