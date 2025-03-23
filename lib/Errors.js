export class DiceDBError extends Error {
    constructor(opts = {}) {
        super(opts.message);
        this.name = opts.name ?? 'DiceDBError';

        if (opts.cause instanceof AggregateError) {
            this.cause = opts.cause;
            this.errors = opts.cause.errors;
        } else if (opts.cause instanceof Error) {
            this.cause = opts.cause;
        }
    }
}

export class DiceDBConnectionError extends DiceDBError {
    constructor(opts = {}) {
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
    constructor(opts = {}) {
        super({
            name: 'DiceDBTimeoutError',
            message:
                opts.message ?? 'A timeout ocurred when processing the request',
            ...opts,
            timeout: opts.timeout,
        });
    }
}

export class DiceDBCommandError extends DiceDBError {
    constructor(opts = {}) {
        super({
            name: 'DiceDBCommandError',
            message: opts.message ?? 'There was an error runnning the command',
            ...opts,
        });
    }
}
