import { Transform } from 'stream';
import { WatchableCommand } from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';

export default class HGetAllWatchCommand extends WatchableCommand {
    static get command() {
        return COMMANDS.HGETALL_WATCH;
    }

    /**
     * Executes the HGETALL.WATCH command to retrieve all fields and values in a hash stored at a key and watch it for changes.
     * 
     * @param {string} key - The key of the hash.
     * @returns A Transform stream that emits the result of the command.
    */
    async exec(key: string) {
        validateKey(key);

        const readable = await super.exec(key);

        const transform = new Transform({
            objectMode: true,
            transform: (data, _encoding, callback) => {
                data.data.result = data.data.result.reduce((map: Record<string, string>, entry: any) => {
                    map[entry.key] = entry.value;
                    return map;
                }, {});

                callback(null, data);
            },
        });

        return readable.pipe(transform);
    }
}
