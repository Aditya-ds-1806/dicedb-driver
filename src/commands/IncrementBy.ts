import Command from '../../lib/Command';
import { validateKey, validateInteger } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class IncrementByCommand extends Command {
    static get command() {
        return COMMANDS.INCRBY;
    }

    /**
     * Executes the INCRBY command to increment the value of a key by a specified delta.
     *
     * @param {string} key - The key whose value will be incremented.
     * @param {number} delta - The amount by which the key's value will be incremented.
     * @returns A promise that resolves with the new value of the key.
     */
    async exec(key: string, delta: number) {
        validateKey(key);
        validateInteger(delta);

        return super.exec(key, delta);
    }
}
