/**
 * @generated
 * --------------------------------------------------------------
 * This file was automatically generated.
 * Source: build.ts
 * Date: 2025-04-08T17:02:07.588Z
 * 
 * ⚠️ DO NOT MODIFY THIS FILE MANUALLY ⚠️
 * Changes will be overwritten the next time it is built.
 * --------------------------------------------------------------
 */

import { Readable } from "stream";

import DiceDBBase, { type DiceDBOptions } from "./src/dicedb";
import { DiceDBResponse } from "./lib/Parsers";
import { GetAndSetExpiryCommandOptions } from './src/commands/GetAndSetExpiry';
import { SetCommandOptions } from './src/commands/Set';

class DiceDB extends DiceDBBase {
	async decrement(key: string) {
		return this.execCommand('DECR', key) as Promise<DiceDBResponse>;
	}

	async decrementBy(key: string, delta: number) {
		return this.execCommand('DECRBY', key, delta) as Promise<DiceDBResponse>;
	}

	async delete(...keys: string[]) {
		return this.execCommand('DEL', ...keys) as Promise<DiceDBResponse>;
	}

	async echo(message: string) {
		return this.execCommand('ECHO', message) as Promise<DiceDBResponse>;
	}

	async exists(...keys: string[]) {
		return this.execCommand('EXISTS', ...keys) as Promise<DiceDBResponse>;
	}

	async expire(key: string, seconds: number, condition: "NX" | "XX") {
		return this.execCommand('EXPIRE', key, seconds, condition) as Promise<DiceDBResponse>;
	}

	async expireAt(key: string, timestamp: number, condition: "NX" | "XX" | "GT" | "LT") {
		return this.execCommand('EXPIREAT', key, timestamp, condition) as Promise<DiceDBResponse>;
	}

	async expireTime(key: string) {
		return this.execCommand('EXPIRETIME', key) as Promise<DiceDBResponse>;
	}

	async flushDB() {
		return this.execCommand('FLUSHDB', ) as Promise<DiceDBResponse>;
	}

	async get(key: string) {
		return this.execCommand('GET', key) as Promise<DiceDBResponse>;
	}

	async getAndDelete(key: string) {
		return this.execCommand('GETDEL', key) as Promise<DiceDBResponse>;
	}

	async getAndSetExpiry(key: string, opts: GetAndSetExpiryCommandOptions) {
		return this.execCommand('GETEX', key, opts) as Promise<DiceDBResponse>;
	}

	async getWatch(key: string) {
		return this.execCommand('GET.WATCH', key) as Promise<Readable>;
	}

	async handshake(execMode: "command" | "watch") {
		return this.execCommand('HANDSHAKE', execMode) as Promise<DiceDBResponse>;
	}

	async increment(key: string) {
		return this.execCommand('INCR', key) as Promise<DiceDBResponse>;
	}

	async incrementBy(key: string, delta: number) {
		return this.execCommand('INCRBY', key, delta) as Promise<DiceDBResponse>;
	}

	async ping(message: string) {
		return this.execCommand('PING', message) as Promise<DiceDBResponse>;
	}

	async set(key: string, value: string | number, opts: SetCommandOptions) {
		return this.execCommand('SET', key, value, opts) as Promise<DiceDBResponse>;
	}

	async ttl(key: string) {
		return this.execCommand('TTL', key) as Promise<DiceDBResponse>;
	}

	async type(key: string) {
		return this.execCommand('TYPE', key) as Promise<DiceDBResponse>;
	}

	async unwatch(fingerprint: string) {
		return this.execCommand('UNWATCH', fingerprint) as Promise<DiceDBResponse>;
	}

}

export { DiceDB as default, type DiceDBOptions, type DiceDBResponse };