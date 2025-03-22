import { encodeCommand, decodeResponse } from "../build/cmd.js";
import { responseParser } from "./Parsers.js";

export default class Command {
    constructor(opts = {}) {
        this.conn = opts.conn;
        this.client_id = opts.client_id;
        this.command = this.constructor.command;
    }

    async exec(...args) {
        const msg = encodeCommand({
            cmd: this.command,
            args: args.filter(arg => arg !== null || arg !== 'undefined')
        });

        const data = await this.conn.write(msg);

        return { data: responseParser(decodeResponse(data)) }
    }
}
