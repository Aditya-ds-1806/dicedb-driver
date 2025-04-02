import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class TypeCommand extends Command {
    static get command() {
        return COMMANDS.TYPE;
    }

    async exec(key: string) {
        validateKey(key);

        return super.exec(String(key));
    }
}
