import debug from 'debug'

export default class Logger {
    constructor(namespace) {
        this.debug = debug(namespace);
    }

    info(...args) {
        if (args.length === 0) {
            return;
        }

        this.debug.color = 6;
        this.debug(args.join(' '));
    }

    warn(...args) {
        if (args.length === 0) {
            return;
        }

        this.debug.color = 3;
        this.debug(args.join(' '));
    }

    error(...args) {
        if (args.length === 0) {
            return;
        }

        this.debug.color = 1;

        for (const arg of args) {
            if (arg instanceof Error) {
                this.debug(arg.stack);
            } else {
                this.debug(arg);
            }
        }
    }

    success(...args) {
        if (args.length === 0) {
            return;
        }

        this.debug.color = 2;
        this.debug(args.join(' '));
    }
}
