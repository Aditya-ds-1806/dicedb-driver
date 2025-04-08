/**
 * @generated
 * --------------------------------------------------------------
 * This file was automatically generated.
 * Source: build.ts
 * Date: 2025-04-08T16:14:22.596Z
 * 
 * ⚠️ DO NOT MODIFY THIS FILE MANUALLY ⚠️
 * Changes will be overwritten the next time it is built.
 * --------------------------------------------------------------
 */

import { Readable } from "stream";

import DiceDBBase, { type DiceDBOptions } from "./src/dicedb";
import { ParsedResponse } from "./lib/Parsers";
import { GetAndSetExpiryCommandOptions } from './src/commands/GetAndSetExpiry';
import { SetCommandOptions } from './src/commands/Set';

class DiceDB extends DiceDBBase {
	async decrement(key: string) {
		return this.execCommand('DECR', key) as Promise<ParsedResponse>;
	}

	async decrementBy(key: string, delta: number) {
		return this.execCommand('DECRBY', key, delta) as Promise<ParsedResponse>;
	}

	async delete(...keys: string[]) {
		return this.execCommand('DEL', ...keys) as Promise<ParsedResponse>;
	}

	async echo(message: string) {
		return this.execCommand('ECHO', message) as Promise<ParsedResponse>;
	}

	async exists(...keys: string[]) {
		return this.execCommand('EXISTS', ...keys) as Promise<ParsedResponse>;
	}

	async expire(key: string, seconds: number, condition: "NX" | "XX") {
		return this.execCommand('EXPIRE', key, seconds, condition) as Promise<ParsedResponse>;
	}

	async expireAt(key: string, timestamp: number, condition: "NX" | "XX" | "GT" | "LT") {
		return this.execCommand('EXPIREAT', key, timestamp, condition) as Promise<ParsedResponse>;
	}

	async expireTime(key: string) {
		return this.execCommand('EXPIRETIME', key) as Promise<ParsedResponse>;
	}

	async flushDB() {
		return this.execCommand('FLUSHDB', ) as Promise<ParsedResponse>;
	}

	async get(key: string) {
		return this.execCommand('GET', key) as Promise<ParsedResponse>;
	}

	async getAndDelete(key: string) {
		return this.execCommand('GETDEL', key) as Promise<ParsedResponse>;
	}

	async getAndSetExpiry(key: string, opts: GetAndSetExpiryCommandOptions) {
		return this.execCommand('GETEX', key, opts) as Promise<ParsedResponse>;
	}

	async getWatch(key: string) {
		return this.execCommand('GET.WATCH', key) as Promise<Readable>;
	}

	async handshake(execMode: "command" | "watch") {
		return this.execCommand('HANDSHAKE', execMode) as Promise<ParsedResponse>;
	}

	async increment(key: string) {
		return this.execCommand('INCR', key) as Promise<ParsedResponse>;
	}

	async incrementBy(key: string, delta: number) {
		return this.execCommand('INCRBY', key, delta) as Promise<ParsedResponse>;
	}

	async ping(message: string) {
		return this.execCommand('PING', message) as Promise<ParsedResponse>;
	}

	async set(key: string, value: string | number, opts: SetCommandOptions) {
		return this.execCommand('SET', key, value, opts) as Promise<ParsedResponse>;
	}

	async ttl(key: string) {
		return this.execCommand('TTL', key) as Promise<ParsedResponse>;
	}

	async type(key: string) {
		return this.execCommand('TYPE', key) as Promise<ParsedResponse>;
	}

	async unwatch(fingerprint: string) {
		return this.execCommand('UNWATCH', fingerprint) as Promise<ParsedResponse>;
	}

}

export { DiceDB as default, type DiceDBOptions };