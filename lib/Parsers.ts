import type { Response } from '../proto/cmd_pb';

export interface DiceDBResponse {
    success: boolean;
    error: string | null;
    data: {
        result: unknown;
        vList: unknown[];
        attrs: Record<string, unknown>;
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
