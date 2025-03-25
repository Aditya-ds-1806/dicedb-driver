/**
    {
        '$typeName': 'wire.Response',
        err: '',
        value: { case: 'vStr', value: 'OK' },
        vList: []
    }
 */
export const responseParser = (response) => {
    const {
        $typeName,
        err = '',
        value: { case: valueCase, value },
        vList = [],
        attrs = {},
    } = response;

    return {
        success: err === '',
        error: err === '' ? null : err,
        data: {
            result: value,
            vList,
            attrs,
            meta: {
                $typeName,
                valueCase,
            },
        },
    };
};
