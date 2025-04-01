export const validateKey = (key: string | number): string | number => {
    if (typeof key !== 'string' && typeof key !== 'number') {
        const err = new TypeError('key must be a string or number!');
        throw err;
    }

    return key;
};

export const validateKeys = (keys: (string | number)[]): boolean => {
    for (const key of keys) {
        validateKey(key);
    }

    return true;
};

export const validateSetValue = (val: string | number): boolean => {
    if (typeof val !== 'string' && typeof val !== 'number') {
        throw new Error('value for set must be a string or a number');
    }

    return true;
};

interface ValidateIntegerOptions {
    min?: number;
    max?: number;
    fieldName?: string;
}

export const validateInteger = (
    num: number,
    opts: ValidateIntegerOptions = {},
): boolean => {
    const { min, max, fieldName } = opts;

    if (!Number.isSafeInteger(num)) {
        const err = new TypeError(`${fieldName ?? 'num'} must be an integer!`);
        throw err;
    }

    if (min && Number.isFinite(min) && num < min) {
        const err = new RangeError(`${fieldName ?? 'num'} must be >= ${min}!`);
        throw err;
    }

    if (max && Number.isFinite(max) && num > max) {
        const err = new RangeError(`${fieldName ?? 'num'} must be <= ${max}!`);
        throw err;
    }

    return true;
};

export const validateTimestamp = (timestamp: number): boolean => {
    validateInteger(timestamp, { fieldName: 'timestamp', min: 0 });

    return true;
};

export const validateTime = (time: number): boolean => {
    validateInteger(time, { fieldName: 'time', min: 0 });

    return true;
};
