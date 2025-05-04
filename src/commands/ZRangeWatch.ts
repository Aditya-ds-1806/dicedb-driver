import { Transform } from 'stream';

import { WatchableCommand } from '../../lib/Command';
import { validateInteger, validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';
import { ZRangeCommandOptions } from './ZRange';
import { ZElement } from '../../proto/res_pb';

export default class ZRangeWatchCommand extends WatchableCommand {
    static get command() {
        return COMMANDS.ZRANGE_WATCH;
    }

    /**
     * Executes the ZRANGE.WATCH command to get elements from a sorted set.
     * 
     * @param {string} key - The key of the sorted set.
     * @param {ZRangeCommandOptions} opts - The options for the range.
     * @returns A promise that resolves with a readable stream of elements in the specified range.
     */
    async exec(key: string, opts: ZRangeCommandOptions) {
        const { start, stop } = opts;

        validateKey(key);
        validateInteger(start, { fieldName: 'start' });
        validateInteger(stop, { min: start, fieldName: 'stop' });

        const readable = await super.exec(key, start, stop);

        const transform = new Transform({
            objectMode: true,
            transform: (data, _encoding, callback) => {
                data.data.result = data.data.result?.reduce((map: Map<string, bigint>, item: ZElement) => {
                    map.set(item.member, item.score);
        
                    return map;
                }, new Map());

                callback(null, data);
            },
        });

        return readable.pipe(transform);
    }
}
