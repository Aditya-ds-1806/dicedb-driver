const vIntParser = (vInt) => {
    const { low, high, unsigned } = vInt;

    const LOW_MASK = BigInt(0xffffffff); // 32-bit mask
    const HIGH_SHIFT = BigInt(32);

    let bigLow = BigInt(low) & LOW_MASK;
    let bigHigh = BigInt(high) & LOW_MASK;

    let result = (bigHigh << HIGH_SHIFT) | bigLow;

    if (!unsigned && high & (1 << 31)) {
        // If signed and high bit of 'high' is set, convert to negative
        result = result - (BigInt(1) << BigInt(64));
    }

    const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);
    const MIN_SAFE = BigInt(Number.MIN_SAFE_INTEGER);

    if (result < MIN_SAFE || result > MAX_SAFE) {
        return result; // unsafe to convert to regular number
    }

    return Number(result);
};

export const responseParser = (response) => {
    const {
        err,
        v_nil: vNil,
        v_str: vStr,
        v_float: vFloat,
        v_bytes: vBytes,
    } = response;

    let { v_int: vInt } = response;

    if (vInt) {
        vInt = vIntParser(vInt);
    }

    return {
        err: err ?? null,
        isNull: vNil ?? false,
        result: vInt ?? vStr ?? vFloat ?? vBytes ?? null,
    };
};
