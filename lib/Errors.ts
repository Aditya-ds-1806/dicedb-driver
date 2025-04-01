export interface DiceDBErrorOptions {
    message?: string;
    name?: string;
    cause?: Error | AggregateError;
    timeout?: number;
}

export class DiceDBError extends Error {
    name: string;
    cause?: Error | AggregateError;
    errors?: Error[];

    constructor(opts: DiceDBErrorOptions = {}) {
        super(opts.message);
        this.name = opts.name ?? 'DiceDBError';

        if (opts.cause instanceof AggregateError) {
            this.cause = opts.cause;
            this.errors = opts.cause.errors;
        } else if (opts.cause instanceof Error) {
            this.cause = opts.cause;
        }

        // Maintain the stack trace in V8 engines
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export class DiceDBConnectionError extends DiceDBError {
    constructor(opts: DiceDBErrorOptions = {}) {
        super({
            name: 'DiceDBConnectionError',
            message:
                opts.message ??
                'There was some trouble establishing a connection',
            ...opts,
        });
    }
}

export class DiceDBTimeoutError extends DiceDBError {
    timeout?: number;

    constructor(opts: DiceDBErrorOptions = {}) {
        super({
            name: 'DiceDBTimeoutError',
            message:
                opts.message ??
                'A timeout occurred when processing the request',
            ...opts,
        });
        this.timeout = opts.timeout;
    }
}

export class DiceDBCommandError extends DiceDBError {
    constructor(opts: DiceDBErrorOptions = {}) {
        super({
            name: 'DiceDBCommandError',
            message: opts.message ?? 'There was an error running the command',
            ...opts,
        });
    }
}
