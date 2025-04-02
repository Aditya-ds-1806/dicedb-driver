import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class GetCommand extends Command {
    static get command() {
        return COMMANDS.GET;
    }

    async exec(key: string) {
        validateKey(key);

        return super.exec(key);
    }
}
