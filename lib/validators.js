export const validateKey = (key) => {
    if (typeof key !== 'string' && typeof key !== 'number') {
        const err = new TypeError('key must be a string!');
        throw err;
    }

    return key;
};

export const validateKeys = (keys) => {
    for (const key of keys) {
        validateKey(key);
    }

    return true;
};

export const validateSetValue = (val) => {
    if (typeof val !== 'string' && typeof val !== 'number') {
        throw new Error('value for set must be a string or a number');
    }

    return true;
};

export const validateInteger = (num, opts = {}) => {
    const { min, max, fieldName } = opts;

    if (!Number.isSafeInteger(num)) {
        const err = new TypeError(`${fieldName ?? 'num'} must be an integer!`);
        throw err;
    }

    if (Number.isFinite(min) && num < min) {
        const err = new RangeError(`${fieldName ?? 'num'} must be >= ${min}!`);
        throw err;
    }

    if (Number.isFinite(max) && num > max) {
        const err = new RangeError(`${fieldName ?? 'num'} must be <= ${max}!`);
        throw err;
    }

    return true;
};

export const validateTimestamp = (timestamp) => {
    validateInteger(timestamp, { fieldName: 'timestamp', min: 0 });

    return true;
};

export const validateTime = (time) => {
    validateInteger(time, { fieldName: 'time', min: 0 });

    return true;
};
