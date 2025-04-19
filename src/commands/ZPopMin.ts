import Command from '../../lib/Command';
import { validateInteger, validateKey } from '../../lib/Validators';
import { ZElement } from '../../proto/res_pb';
import { COMMANDS } from '../constants/commands';

export default class ZPopMinCommand extends Command {
    static get command() {
        return COMMANDS.ZPOPMIN;
    }

    /**
     * Remove and return the member with the lowest score in a sorted set
     * 
     * @param {string} key - The key of the sorted set
     * @param {number} count - Options specifying the number of elements to pop
     * @returns The member with the lowest score and its score
     */
    async exec(key: string, count?: number) {
        const defaultCount = 1;
        count = count ?? defaultCount;

        validateKey(key);
        validateInteger(count, { min: 1, fieldName: 'count' });

        const response = await super.exec(key, count);

        if (response.data.result) {
            response.data.result = response.data.result.reduce((map: Map<string, bigint>, item: ZElement) => {
                map.set(item.member, item.score);
                
                return map;
            }, new Map());
        }

        return response;
    }
}
