import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class TTLCommand extends Command {
    static get command() {
        return COMMANDS.TTL;
    }

    async exec(key: string) {
        validateKey(key);

        return super.exec(String(key));
    }
}
