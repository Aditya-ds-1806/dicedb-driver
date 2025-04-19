import { Result, Status } from '../proto/res_pb';

export interface DiceDBResponse {
    success: boolean;
    error: string | null;
    data: {
        result: any;
        meta: {
            $typeName: string;
            valueCase: string | undefined;
            fingerprint: bigint;
        };
    };
}

export const responseParser = (response: Result): DiceDBResponse => {
    const {
        $typeName,
        status,
        response: { case: valueCase, value },
        message,
        fingerprint64,
    } = response;

    let parsedValue = null

    switch (value?.$typeName) {
        case 'wire.DECRRes':
        case 'wire.DECRBYRes':
        case 'wire.GETRes':
        case 'wire.GETSETRes':
        case 'wire.HGETRes':
        case 'wire.INCRBYRes':
        case 'wire.INCRRes':
        case 'wire.GETDELRes':
        case 'wire.GETEXRes':
            parsedValue = value.value;
            break;
        
        case 'wire.HANDSHAKERes':
            parsedValue = value.$unknown;
            break;
        
        case 'wire.HGETALLRes':
        case 'wire.ZPOPMAXRes':
            parsedValue = value.elements;
            break;

        case 'wire.ECHORes':
        case 'wire.PINGRes':
            parsedValue = value.message;
            break;

        case 'wire.DELRes':
        case 'wire.HSETRes':
        case 'wire.EXISTSRes':
        case 'wire.ZADDRes':
        case 'wire.ZCARDRes':
        case 'wire.ZCOUNTRes':
            parsedValue = value.count;
            break;

        case 'wire.EXPIREATRes':
        case 'wire.EXPIRERes':
            parsedValue = value.isChanged;
            break;
        
        case 'wire.EXPIRETIMERes':
            parsedValue = value.unixSec;
            break;

        case 'wire.KEYSRes':
            parsedValue = value.keys;
            break;
            
        case 'wire.TYPERes':
            parsedValue = value.type;
            break;

        case 'wire.TTLRes':
            parsedValue = value.seconds;
            break;

        case 'wire.GETWATCHRes':
        case 'wire.HGETALLWATCHRes':
        case 'wire.HGETWATCHRes':
        case 'wire.SETRes':
        case 'wire.FLUSHDBRes':
        case 'wire.UNWATCHRes':
            parsedValue = message;
            break;
        
        default:
            parsedValue = null;
            break;
    }

    return {
        success: status === Status.OK,
        error: status === Status.OK ? null : response.message,
        data: {
            result: parsedValue,
            meta: {
                $typeName: value?.$typeName || $typeName,
                valueCase,
                fingerprint: fingerprint64,
            },
        },
    };
};
