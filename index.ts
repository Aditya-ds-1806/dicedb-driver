/**
 * @generated
 * --------------------------------------------------------------
 * This file was automatically generated.
 * Source: build.ts
 * Date: 2025-04-19T16:24:27.015Z
 * 
 * ⚠️ DO NOT MODIFY THIS FILE MANUALLY ⚠️
 * Changes will be overwritten the next time it is built.
 * --------------------------------------------------------------
 */

import { Readable, Transform } from "stream";

import DiceDBBase, { type DiceDBOptions } from "./src/dicedb";
import { DiceDBResponse } from "./lib/Parsers";
import { GetAndSetExpiryCommandOptions } from './src/commands/GetAndSetExpiry';
import { SetCommandOptions } from './src/commands/Set';
import { ZAddCommandOptions } from './src/commands/ZAdd';
import { ZCountOptions } from './src/commands/ZCount';


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
     * @returns A promise that resolves with a boolean indicating if the timeout was set.
     */
	async expire(key: string, seconds: number, condition: "NX" | "XX" | undefined) {
		return this.execCommand('EXPIRE', key, seconds, condition) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the EXPIREAT command to set a timeout on a key at a specific timestamp.
     *
     * @param {string} key - The key to set the timeout on.
     * @param {number} timestamp - The Unix timestamp at which the key will expire.
     * @param condition - The condition for setting the timeout.
     * @returns A promise that resolves with a boolean indicating if the timeout was set.
     */
	async expireAt(key: string, timestamp: number, condition: "NX" | "XX" | "GT" | "LT" | undefined) {
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
     * Executes the GETSET command to set and get the old value of a key.
     *
     * @param {string} key - The key whose old value will be retrieved.
     * @param {number | string} value - The value to set.
     * @returns A promise that resolves with the old value of the key.
     */
	async getSet(key: string, value: string | number) {
		return this.execCommand('GETSET', key, value) as Promise<DiceDBResponse>;
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
     * Executes the HGET command to retrieve the value of a field in a hash stored at a key.
     *
     * @param {string} key - The key of the hash.
     * @param {string} fieldName - The field name whose value will be retrieved.
     * @returns A promise that resolves with the value of the field, or null if the field does not exist.
     */
	async hGet(key: string, fieldName: string) {
		return this.execCommand('HGET', key, fieldName) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the HGET command to retrieve the value of a field in a hash stored at a key.
     *
     * @param {string} key - The key of the hash.
     * @returns A promise that resolves with the value of the field, or null if the field does not exist.
     */
	async hGetAll(key: string) {
		return this.execCommand('HGETALL', key) as Promise<DiceDBResponse>;
	}


	/**
     * Executes the HGETALL_WATCH command to retrieve all fields and values in a hash stored at a key and watch it for changes.
     * 
     * @param {string} key - The key of the hash.
     * @returns A Transform stream that emits the result of the command.
    */
	async hGetAllWatch(key: string) {
		return this.execCommand('HGETALL.WATCH', key) as Promise<Transform>;
	}


	/**
     * Executes the HGET_WATCH command to retrieve the value of a field in a hash and watch it for changes.
     *
     * @param {string} key - The key of the hash.
     * @param {string} field - The field to retrieve and watch.
     * @returns A promise that resolves to a Node.js Readable Stream
     */
	async hGetWatch(key: string, field: string) {
		return this.execCommand('HGET.WATCH', key, field) as Promise<Readable>;
	}


	/**
     * Executes the HSET command to set the value of a field in a hash stored at key.
     *
     * @param {string} key - The key of the hash.
     * @param {Record<string, number | string>} map - An object representing field-value pairs to set in the hash.
     * @returns A promise that resolves with the result of the command execution.
     */
	async hSet(key: string, map: Record<string, string | number>) {
		return this.execCommand('HSET', key, map) as Promise<DiceDBResponse>;
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
	async ping(message: string | undefined) {
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


	/**
     * Executes the ZADD command to add elements to a sorted set with optional
     * options for adding elements.
     *
     * @param {string} key - The key of the sorted set.
     * @param {Record<string, number | string>} map - A map of members and their scores.
     * @param opts - The options for adding elements to the sorted set.
     * @returns A promise that resolves when the elements are added successfully.
     */
	async zAdd(key: string, map: Record<string, string | number>, opts: ZAddCommandOptions | undefined) {
		return this.execCommand('ZADD', key, map, opts) as Promise<DiceDBResponse>;
	}


	/**
     * Get the number of members in a sorted set
     * 
     * @param {string} key - The key of the sorted set
     * @returns The number of members in the sorted set
     */
	async zCard(key: string) {
		return this.execCommand('ZCARD', key) as Promise<DiceDBResponse>;
	}


	/**
     * Get the count of members in a sorted set with scores between min and max
     * 
     * @param {string} key - The key of the sorted set
     * @param {ZCountOptions} opts - Options specifying the score range
     * @returns Count of members with scores in the range
     */
	async zCount(key: string, opts: ZCountOptions | undefined) {
		return this.execCommand('ZCOUNT', key, opts) as Promise<DiceDBResponse>;
	}


	/**
     * Remove and return the member with the highest score in a sorted set
     * 
     * @param {string} key - The key of the sorted set
     * @param {number} count - Options specifying the number of elements to pop
     * @returns The member with the highest score and its score
     */
	async zPopMax(key: string, count: number | undefined) {
		return this.execCommand('ZPOPMAX', key, count) as Promise<DiceDBResponse>;
	}

}

export { DiceDB as default, type DiceDBOptions, type DiceDBResponse };