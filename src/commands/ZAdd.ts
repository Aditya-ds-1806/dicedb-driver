import Command from "../../lib/Command";
import { DiceDBCommandError } from "../../lib/Errors";
import { validateKey } from "../../lib/Validators";
import { COMMANDS } from "../constants/commands";

export interface ZAddCommandOptions {
    /**
     * Only add new elements and do not update existing elements
     */
    nx?: boolean;
    /**
     * Only update existing elements and do not add new elements
     */
    xx?: boolean;
    /**
     * Only add new elements if the score is greater than the existing score
     */
    gt?: boolean;
    /**
     * Only add new elements if the score is less than the existing score
     */
    lt?: boolean;
    /**
     * Modify the return value from the number of new elements added to the
     * total number of elements changed
     */
    ch?: boolean;
    /**
     * When this option is specified, the scores provided are treated as 
     * increments to the score of the existing elements
     */
    incr?: boolean;
}

export default class ZAddCommand extends Command {
    static get command() {
        return COMMANDS.ZADD;
    }

    /**
     * Executes the ZADD command to add elements to a sorted set with optional
     * options for adding elements.
     *
     * @param {string} key - The key of the sorted set.
     * @param {Record<string, number | string> | Map<string, number | string>} map - A map of members and their scores.
     * @param opts - The options for adding elements to the sorted set.
     * @returns A promise that resolves when the elements are added successfully.
     */
    async exec(key: string, map: Record<string, number | string> | Map<string, number | string>, opts?: ZAddCommandOptions) {
        validateKey(key);

        const args = [key];

        if (opts?.nx) {
            args.push('NX');
        } else if (opts?.xx) {
            args.push('XX');
        }

        if (opts?.gt) {
            args.push('GT');
        } else if (opts?.lt) {
            args.push('LT');
        }

        if (opts?.ch) {
            args.push('CH');
        }

        if (opts?.incr) {
            args.push('INCR');
        }

        const memberScorePairs = map instanceof Map ? 
            [...map.entries()].map(([member, score]) => [score, member]).flat() : 
            Object.entries(map).map(([member, score]) => [score, member]).flat();

        if (opts?.incr && (opts?.gt || opts?.lt)) {
            throw new DiceDBCommandError({
                message: 'The INCR option cannot be used with the GT or LT options.',
            });
        }

        if (opts?.incr && memberScorePairs.length > 2) {
            throw new DiceDBCommandError({
                message: 'The INCR option can only be used with a single member and score.',
            });
        }

        return super.exec(...args, ...memberScorePairs);
    }
}
