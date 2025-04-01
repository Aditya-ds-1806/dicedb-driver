import { WatchableCommand } from '../../lib/Command.ts';
import { validateKey } from '../../lib/Validators.ts';
import { COMMANDS } from '../constants/commands.ts';

export default class GetWatchCommand extends WatchableCommand {
    static get command() {
        return COMMANDS.GET_WATCH;
    }

    async exec(key: string) {
        validateKey(key);

        return super.exec(String(key));
    }
}
