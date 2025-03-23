import crypto from 'node:crypto';

export const delay = async (waitTimeMS) =>
    new Promise((resolve) => setTimeout(resolve, waitTimeMS));

export const timeout = async (ms, err) =>
    new Promise((_, reject) =>
        setTimeout(() => {
            reject(err);
        }, ms),
    );

export const uuid = () => {
    const [chunk1] = crypto.randomUUID().split('-');

    return chunk1;
};
