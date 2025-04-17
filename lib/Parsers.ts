import { Result, Status } from '../proto/res_pb';

export interface DiceDBResponse {
    success: boolean;
    error: string | null;
    data: {
        result: Result['response']['value'];
        meta: {
            $typeName: string;
            valueCase: string | undefined;
        };
    };
}

export const responseParser = (response: Result): DiceDBResponse => {
    const {
        $typeName,
        status,
        response: { case: valueCase, value },
    } = response;

    return {
        success: status === Status.OK,
        error: status === Status.OK ? null : response.message,
        data: {
            result: value,
            meta: {
                $typeName,
                valueCase,
            },
        },
    };
};
