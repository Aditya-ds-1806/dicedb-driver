import { Transform } from 'node:stream';

import { WatchableCommand } from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { COMMANDS } from '../constants/commands';
import { ZElement } from '../../proto/res_pb';
import { DiceDBResponse } from '../../dist';

export default class ZRankWatchCommand extends WatchableCommand {
    static get command() {
        return COMMANDS.ZRANK_WATCH;
    }

    /**
     * Executes the ZRANK.WATCH command to retrieve the rank of a member in a sorted set.
     * 
     * @param {string} key - The key of the sorted set
     * @param {string} member - The member whose rank to watch
     * @returns The rank of the member in the sorted set
     */
    async exec(key: string, member: string) {
        validateKey(key);
        validateKey(member);

        const readable = await super.exec(key, member);

        const transform = new Transform({
            objectMode: true,
            transform: (data: DiceDBResponse, _encoding, callback) => {
                if (!data.error) {
                    data.data.result.rank = 0n;

                    if (data.data.result.element) {
                        const { score, member, rank }: ZElement = data.data.result.element;
                        data.data.result.element = new Map([[member, score]]);
                        data.data.result.rank = rank ?? 0n;
                    }
                }

                callback(null, data);
            }
        });

        return readable.pipe(transform);
    }
}
