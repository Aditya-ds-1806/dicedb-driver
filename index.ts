/**
 * @generated
 * --------------------------------------------------------------
 * This file was automatically generated.
 * Source: build.ts
 * Date: 2025-04-11T15:46:57.818Z
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


/**
 * The DiceDB class provides an interface to interact with the DiceDB server.
 * It manages the connection pool, command execution, and client configuration.
 *
 * Usage:
 * ```typescript
 * const db = new DiceDB({ host: 'localhost', port: 6379 });
 * await db.connect();
 * await db.set('name', 'Aditya');
 * await db.get('name'); // Aditya
 * ```
 */
class DiceDB extends DiceDBBase {

	/**
     * Executes the DECR command to decrement the value of the specified key by 1.
     *
     * @param {string} key - The key whose value will be decremented.
     * @returns A promise that resolves with the result of the command.
     */
	async decrement(key: string) {
		return this.execCommand('DECR', key) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the DECRBY command to decrement the value of the specified key by a given delta.
     *
     * @param {string} key - The key whose value will be decremented.
     * @param {number} delta - The amount by which the key's value will be decremented.
     * @returns A promise that resolves with the result of the command.
     */
	async decrementBy(key: string, delta: number) {
		return this.execCommand('DECRBY', key, delta) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the DEL command to delete one or more keys.
     *
     * @param {...string} keys - The keys to be deleted.
     * @returns A promise that resolves with the result of the command.
     */
	async delete(...keys: string[]) {
		return this.execCommand('DEL', ...keys) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the ECHO command to return the same message sent to the server.
     *
     * @param {string} [message=''] - The message to be echoed back.
     * @returns A promise that resolves with the echoed message.
     */
	async echo(message: string) {
		return this.execCommand('ECHO', message) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the EXISTS command to check if one or more keys exist.
     *
     * @param {...string} keys - The keys to check for existence.
     * @returns A promise that resolves with the number of keys that exist.
     */
	async exists(...keys: string[]) {
		return this.execCommand('EXISTS', ...keys) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the EXPIRE command to set a timeout on a key.
     *
     * @param {string} key - The key to set the timeout on.
     * @param {number} seconds - The timeout duration in seconds.
     * @param condition - The condition for setting the timeout.
     * @returns A promise that resolves with the result of the command.
     */
	async expire(key: string, seconds: number, condition: "NX" | "XX") {
		return this.execCommand('EXPIRE', key, seconds, condition) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the EXPIREAT command to set a timeout on a key at a specific timestamp.
     *
     * @param {string} key - The key to set the timeout on.
     * @param {number} timestamp - The Unix timestamp at which the key will expire.
     * @param condition - The condition for setting the timeout.
     * @returns A promise that resolves with the result of the command.
     */
	async expireAt(key: string, timestamp: number, condition: "NX" | "XX" | "GT" | "LT") {
		return this.execCommand('EXPIREAT', key, timestamp, condition) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the EXPIRETIME command to get the expiration time of a key.
     *
     * @param {string} key - The key to check the expiration time for.
     * @returns A promise that resolves with the expiration time of the key.
     */
	async expireTime(key: string) {
		return this.execCommand('EXPIRETIME', key) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the FLUSHDB command to remove all keys from the current database.
     *
     * @returns A promise that resolves when the database is cleared.
     */
	async flushDB() {
		return this.execCommand('FLUSHDB', ) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the GET command to retrieve the value of a key.
     *
     * @param {string} key - The key whose value will be retrieved.
     * @returns A promise that resolves with the value of the key.
     */
	async get(key: string) {
		return this.execCommand('GET', key) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the GETDEL command to retrieve and delete the value of a key.
     *
     * @param {string} key - The key whose value will be retrieved and deleted.
     * @returns A promise that resolves with the value of the key before deletion.
     */
	async getAndDelete(key: string) {
		return this.execCommand('GETDEL', key) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the GETEX command to retrieve the value of a key and set its expiry options.
     *
     * @param {string} key - The key whose value will be retrieved.
     * @param opts - The options for setting the expiry.
     * @returns A promise that resolves with the value of the key.
     */
	async getAndSetExpiry(key: string, opts: GetAndSetExpiryCommandOptions) {
		return this.execCommand('GETEX', key, opts) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the GET_WATCH command to retrieve the value of a key and watch it for changes.
     *
     * @param {string} key - The key to retrieve and watch.
     * @returns A promise that resolves to a Node.js Readable Stream
     */
	async getWatch(key: string) {
		return this.execCommand('GET.WATCH', key) as Promise<Readable>;
	}


	/**
     * Executes the HANDSHAKE command to establish a connection with the server.
     *
     * @param {'command' | 'watch'} execMode - The execution mode for the handshake.
     * @returns A promise that resolves when the handshake is successful.
     */
	async handshake(execMode: "command" | "watch") {
		return this.execCommand('HANDSHAKE', execMode) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the INCR command to increment the value of a key by 1.
     *
     * @param {string} key - The key whose value will be incremented.
     * @returns A promise that resolves with the new value of the key.
     */
	async increment(key: string) {
		return this.execCommand('INCR', key) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the INCRBY command to increment the value of a key by a specified delta.
     *
     * @param {string} key - The key whose value will be incremented.
     * @param {number} delta - The amount by which the key's value will be incremented.
     * @returns A promise that resolves with the new value of the key.
     */
	async incrementBy(key: string, delta: number) {
		return this.execCommand('INCRBY', key, delta) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the PING command to test the connection to the server.
     *
     * @param {string} [message] - An optional message to send with the PING command.
     * @returns A promise that resolves with the server's response.
     */
	async ping(message: string) {
		return this.execCommand('PING', message) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the SET command to set the value of a key with optional expiry options.
     *
     * @param {string} key - The key to set the value for.
     * @param {string | number} value - The value to set for the key.
     * @param opts - The options for setting the key, such as expiry time.
     * @returns A promise that resolves when the key is set successfully.
     */
	async set(key: string, value: string | number, opts: SetCommandOptions) {
		return this.execCommand('SET', key, value, opts) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the TTL command to get the remaining time to live of a key.
     *
     * @param {string} key - The key to check the TTL for.
     * @returns A promise that resolves with the TTL of the key in seconds.
     */
	async ttl(key: string) {
		return this.execCommand('TTL', key) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the TYPE command to get the data type of a key.
     *
     * @param {string} key - The key to check the data type for.
     * @returns A promise that resolves with the data type of the key.
     */
	async type(key: string) {
		return this.execCommand('TYPE', key) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the UNWATCH command to remove all watched keys for the current connection.
     *
     * @param {string} fingerprint - The unique identifier for the connection.
     * @returns A promise that resolves when the keys are unwatched.
     */
	async unwatch(fingerprint: string) {
		return this.execCommand('UNWATCH', fingerprint) as Promise<DiceDBResponse>;
	}

}

export { DiceDB as default, type DiceDBOptions, type DiceDBResponse };