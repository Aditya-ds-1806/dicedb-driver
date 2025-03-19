const validateKey = (key) => {
    if (typeof key !== 'string' && typeof key !== 'number') {
        const err = new TypeError('key must be a string!');
        throw err;
    }

    return true;
}

const validateKeys = (keys) => {
    for (const key of keys) {
        validateKey(key);
    }
}

module.exports = {
    validateKey,
    validateKeys
}
