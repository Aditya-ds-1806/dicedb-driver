import { WatchableCommand } from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class GetWatchCommand extends WatchableCommand {
    static get command() {
        return COMMANDS.GET_WATCH;
    }

    async exec(key: string) {
        validateKey(key);

        return super.exec(String(key));
    }
}
