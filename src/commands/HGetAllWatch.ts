import { Transform } from 'node:stream';

import { WatchableCommand } from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';
import { HElement } from '../../proto/res_pb';

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
                data.data.result = data.data.result.reduce((map: Map<string, string>, entry: HElement) => {
                    map.set(entry.key, entry.value);
                    return map;
                }, new Map());

                callback(null, data);
            },
        });

        return readable.pipe(transform);
    }
}
