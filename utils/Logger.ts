import debug from 'debug';

export default class Logger {
    private debug: debug.Debugger;

    constructor(namespace: string) {
        this.debug = debug(namespace);
    }

    info(...args: string[]) {
        if (args.length === 0) {
            return;
        }

        this.debug.color = '6';
        this.debug(args.join(' '));
    }

    warn(...args: string[]) {
        if (args.length === 0) {
            return;
        }

        this.debug.color = '3';
        this.debug(args.join(' '));
    }

    error(...args: (string | Error)[]) {
        if (args.length === 0) {
            return;
        }

        this.debug.color = '1';

        for (const arg of args) {
            if (arg instanceof Error) {
                this.debug(arg.stack);
            } else {
                this.debug(arg);
            }
        }
    }

    success(...args: string[]) {
        if (args.length === 0) {
            return;
        }

        this.debug.color = '2';
        this.debug(args.join(' '));
    }
}
