import Command from '../../lib/Command.js';
import { validateKeys } from '../../lib/Validators.js';
import { COMMANDS } from '../constants/commands.js';

export default class ExistsCommand extends Command {
    static get command() {
        return COMMANDS.EXISTS;
    }

    async exec(...args) {
        validateKeys(args);
        const uniqueKeys = new Set(args.map(String));

        return super.exec(...uniqueKeys);
    }
}
