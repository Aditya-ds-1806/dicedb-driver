import Command from '../../lib/Command';
import { validateKey, validateInteger } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class DecrementByCommand extends Command {
    static get command() {
        return COMMANDS.DECRBY;
    }

    /**
     * Executes the DECRBY command to decrement the value of the specified key by a given delta.
     *
     * @param {string} key - The key whose value will be decremented.
     * @param {number} delta - The amount by which the key's value will be decremented.
     * @returns A promise that resolves with the result of the command.
     */
    async exec(key: string, delta: number) {
        validateKey(key);
        validateInteger(delta);

        return super.exec(key, delta);
    }
}
