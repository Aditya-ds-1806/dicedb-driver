import type { Response } from '../proto/cmd_pb';

export interface DiceDBResponse {
    success: boolean;
    error: string | null;
    data: {
        result: string | number | bigint | boolean | Uint8Array<ArrayBufferLike> | undefined;
        vList: any[];
        attrs: Record<string, any>;
        meta: {
            $typeName: string;
            valueCase: string | undefined;
        };
    };
}

export const responseParser = (response: Response): DiceDBResponse => {
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
