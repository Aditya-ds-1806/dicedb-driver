import crypto from 'node:crypto';

/**
 * Delays execution for a given number of milliseconds.
 * @param waitTimeMS - The number of milliseconds to wait.
 * @returns A promise that resolves after the specified delay.
 */
export const delay = async (waitTimeMS: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, waitTimeMS));

/**
 * Creates a promise that rejects after a given timeout.
 * @param ms - Timeout duration in milliseconds.
 * @param err - The error to reject with.
 * @returns A promise that rejects with the provided error after the timeout.
 */
export const timeout = async (ms: number, err: Error): Promise<never> =>
    new Promise((_, reject) =>
        setTimeout(() => {
            reject(err);
        }, ms),
    );

/**
 * Generates a UUID with an optional prefix.
 * @param prefix - A string prefix to prepend to the UUID.
 * @returns A prefixed UUID.
 */
export const uuid = (prefix: string = ''): string => {
    const [chunk1] = crypto.randomUUID().split('-');
    return `${prefix}${chunk1}`;
};
