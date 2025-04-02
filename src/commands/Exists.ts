import Command from '../../lib/Command';
import { validateKeys } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class ExistsCommand extends Command {
    static get command() {
        return COMMANDS.EXISTS;
    }

    async exec(...keys: string[]) {
        validateKeys(keys);
        const uniqueKeys = new Set(keys.map(String));

        return super.exec(...uniqueKeys);
    }
}
