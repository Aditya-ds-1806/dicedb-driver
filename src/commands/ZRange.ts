import Command from "../../lib/Command";
import { validateInteger, validateKey } from "../../lib/Validators";
import { ZElement } from "../../proto/res_pb";
import { COMMANDS } from "../constants/commands";

export interface ZRangeCommandOptions {
    /**
     * The start score of the range.
     */
    start: number;
    /**
     * The stop score of the range.
     */
    stop: number;
}

export default class ZRangeCommand extends Command {
    static get command() {
        return COMMANDS.ZRANGE;
    }

    /**
     * Executes the ZRANGE command to get elements from a sorted set.
     *
     * @param {string} key - The key of the sorted set.
     * @param {ZRangeCommandOptions} opts - The options for the range.
     * @returns A promise that resolves with the elements in the specified range.
     */
    async exec(key: string, opts: ZRangeCommandOptions) {
        const { start, stop } = opts;

        validateKey(key);
        validateInteger(start, { fieldName: 'start' });
        validateInteger(stop, { min: start, fieldName: 'stop' });

        const response = await super.exec(key, start, stop);

        response.data.result = response.data.result?.reduce((map: Map<string, bigint>, item: ZElement) => {
            map.set(item.member, item.score);

            return map;
        }, new Map());

        return response;
    }
}
