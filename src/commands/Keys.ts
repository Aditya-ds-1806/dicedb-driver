import Command from "../../lib/Command";
import { validateKey } from "../../lib/Validators";
import { COMMANDS } from "../constants/commands";

export default class KeysCommand extends Command {
    static get command() {
        return COMMANDS.KEYS;
    }

    /**
     * Get all keys matching a pattern
     * 
     * @param {string} pattern - The pattern to match keys against
     * @returns A promise that resolves with the list of matching keys
     */
    async exec(pattern: string) {
        validateKey(pattern);
        return super.exec(pattern);
    }
};
