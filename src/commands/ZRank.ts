import Command from '../../lib/Command';
import { validateKey } from '../../lib/Validators';
import { ZElement } from '../../proto/res_pb';
import { COMMANDS } from '../constants/commands';

export default class ZRankCommand extends Command {
    static get command() {
        return COMMANDS.ZRANK;
    }

    /**
     * Get the rank of a member in a sorted set
     * 
     * @param {string} key - The key of the sorted set
     * @param {string} member - The member whose rank to get
     * @returns The rank of the member in the sorted set
     */
    async exec(key: string, member: string) {
        validateKey(key);
        validateKey(member);

        const response = await super.exec(key, member);

        if (response.data.result?.element) {
            const { score, member }: ZElement = response.data.result.element;
            response.data.result.element = new Map([[member, score]]);
        }

        return response;
    }
}
