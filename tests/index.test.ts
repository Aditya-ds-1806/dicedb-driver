import { expect, describe, beforeAll, afterAll } from '@jest/globals';

import DiceDB from '..';
import { Readable } from 'stream';

describe('DiceDB test cases', () => {
    let db: DiceDB;

    beforeAll(async () => {
        db = new DiceDB({
            host: 'localhost',
            port: 7379,
            conn_timeout_ms: 5000,
            query_timeout_ms: 5000,
            idle_timeout_ms: 1000,
        });

        await db.connect();
    });

    describe('DecrementCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should decrement the value of a key by 1', async () => {
            const key = 'testKey';
            const setResult = await db.set(key, 10);
            expect(setResult.success).toBe(true);

            const response = await db.decrement(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(9n);
        });

        it('should initialize to -1 if key does not exist', async () => {
            const key = 'nonExistentKey';
            const response = await db.decrement(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(-1n);
        });

        it('should return error if the value at key is not an integer', async () => {
            const key = 'testKey';
            await db.set(key, 'not-a-number');
            const response = await db.decrement(key);
            expect(response.success).toBe(false);
            expect(response.error).toContain('wrongtype operation');
        });
    });

    describe('DecrementByCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should decrement the value of a key by specified amount', async () => {
            const key = 'testKey';
            await db.set(key, '10');
            const response = await db.decrementBy(key, 3);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(7n);
        });

        it('should initialize to negative of decrement amount if key does not exist', async () => {
            const key = 'nonExistentKey';
            const response = await db.decrementBy(key, 5);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(-5n);
        });

        it('should return error if the value at key is not an integer', async () => {
            const key = 'testKey';
            await db.set(key, 'not-a-number');
            const response = await db.decrementBy(key, 3);
            expect(response.success).toBe(false);
            expect(response.error).toContain('wrongtype operation');
        });
    });

    describe('DeleteCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should delete an existing key and return count as BigInt', async () => {
            const key = 'testKey';
            await db.set(key, 'value');
            const response = await db.delete(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(1n);
        });

        it('should return 0n when trying to delete non-existent key', async () => {
            const key = 'nonExistentKey';
            const response = await db.delete(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(0n);
        });

        it('should delete multiple keys and return count of deleted keys as BigInt', async () => {
            const keys = ['key1', 'key2', 'key3'];
            // Set multiple keys
            for (const key of keys) {
                await db.set(key, 'value');
            }

            const response = await db.delete(...keys);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(3n);
        });
    });

    describe('EchoCommand', () => {
        it('should echo back the provided message', async () => {
            const message = 'Hello DiceDB!';
            const response = await db.echo(message);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(message);
        });

        it('should echo back an empty string when no message is provided', async () => {
            const response = await db.echo();
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('');
        });
    });

    describe('ExistsCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return 1 if key exists', async () => {
            const key = 'testKey';
            await db.set(key, 'value');
            const response = await db.exists(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(1n);
        });

        it('should return 0 if key does not exist', async () => {
            const key = 'nonExistentKey';
            const response = await db.exists(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(0n);
        });

        it('should return count of existing keys when checking multiple keys', async () => {
            const keys = ['key1', 'key2', 'key3'];
            // Set only first two keys
            await db.set(keys[0], 'value1');
            await db.set(keys[1], 'value2');

            const response = await db.exists(...keys);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(2n);
        });
    });

    describe('ExpireCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should set expiry on key and return true', async () => {
            const key = 'testKey';
            await db.set(key, 'value');
            const response = await db.expire(key, 100);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(true);
        });

        it('should return false when key does not exist', async () => {
            const key = 'nonExistentKey';
            const response = await db.expire(key, 100);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(false);
        });

        it('should set expiry only when key has no expiry with NX condition', async () => {
            const key = 'expireKey';
            await db.set(key, 'value');

            // First expire should succeed
            const response1 = await db.expire(key, 100, 'NX');
            expect(response1.success).toBe(true);
            expect(response1.data.result).toEqual(true);

            // Second expire with NX should fail since key already has expiry
            const response2 = await db.expire(key, 200, 'NX');
            expect(response2.success).toBe(true);
            expect(response2.data.result).toEqual(false);
        });

        it('should set expiry only when key has existing expiry with XX condition', async () => {
            const key = 'expireKey';
            await db.set(key, 'value');

            // First expire with XX should fail since key has no expiry
            const response1 = await db.expire(key, 100, 'XX');
            expect(response1.success).toBe(true);
            expect(response1.data.result).toEqual(false);

            // Set initial expiry
            await db.expire(key, 100);

            // Second expire with XX should succeed since key has expiry
            const response2 = await db.expire(key, 200, 'XX');
            expect(response2.success).toBe(true);
            expect(response2.data.result).toEqual(true);
        });
    });

    describe('ExpireAtCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should set expiry at timestamp and return true', async () => {
            const key = 'testKey';
            await db.set(key, 'value');
            const timestamp = Math.floor(Date.now() / 1000) + 100; // 100 seconds from now
            const response = await db.expireAt(key, timestamp);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(true);
        });

        it('should return false when key does not exist', async () => {
            const key = 'nonExistentKey';
            const timestamp = Math.floor(Date.now() / 1000) + 100;
            const response = await db.expireAt(key, timestamp);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(false);
        });

        it('should set expiry only when key has no expiry with NX condition', async () => {
            const key = 'expireAtKey';
            const timestamp = Math.floor(Date.now() / 1000) + 100;
            const futureTimestamp = Math.floor(Date.now() / 1000) + 200;
            await db.set(key, 'value');

            // First expireAt should succeed
            const response1 = await db.expireAt(key, timestamp, 'NX');
            expect(response1.success).toBe(true);
            expect(response1.data.result).toEqual(true);

            // Second expireAt with NX should fail since key already has expiry
            const response2 = await db.expireAt(key, futureTimestamp, 'NX');
            expect(response2.success).toBe(true);
            expect(response2.data.result).toEqual(false);
        });

        it('should set expiry only when key has existing expiry with XX condition', async () => {
            const key = 'expireAtKey';
            const timestamp = Math.floor(Date.now() / 1000) + 100;
            const futureTimestamp = Math.floor(Date.now() / 1000) + 200;
            await db.set(key, 'value');

            // First expireAt with XX should fail since key has no expiry
            const response1 = await db.expireAt(key, timestamp, 'XX');
            expect(response1.success).toBe(true);
            expect(response1.data.result).toEqual(false);

            // Set initial expiry
            await db.expireAt(key, timestamp);

            // Second expireAt with XX should succeed since key has expiry
            const response2 = await db.expireAt(key, futureTimestamp, 'XX');
            expect(response2.success).toBe(true);
            expect(response2.data.result).toEqual(true);
        });

        it('should set expiry only when new expiry is greater with GT condition', async () => {
            const key = 'expireAtKey';
            const timestamp = Math.floor(Date.now() / 1000) + 100;
            const earlierTimestamp = Math.floor(Date.now() / 1000) + 50;
            const laterTimestamp = Math.floor(Date.now() / 1000) + 150;
            await db.set(key, 'value');

            // Set initial expiry
            await db.expireAt(key, timestamp);

            // Earlier timestamp with GT should fail
            const response1 = await db.expireAt(key, earlierTimestamp, 'GT');
            expect(response1.success).toBe(true);
            expect(response1.data.result).toEqual(false);

            // Later timestamp with GT should succeed
            const response2 = await db.expireAt(key, laterTimestamp, 'GT');
            expect(response2.success).toBe(true);
            expect(response2.data.result).toEqual(true);
        });

        it('should set expiry only when new expiry is less with LT condition', async () => {
            const key = 'expireAtKey';
            const timestamp = Math.floor(Date.now() / 1000) + 100;
            const earlierTimestamp = Math.floor(Date.now() / 1000) + 50;
            const laterTimestamp = Math.floor(Date.now() / 1000) + 150;
            await db.set(key, 'value');

            // Set initial expiry
            await db.expireAt(key, timestamp);

            // Later timestamp with LT should fail
            const response1 = await db.expireAt(key, laterTimestamp, 'LT');
            expect(response1.success).toBe(true);
            expect(response1.data.result).toEqual(false);

            // Earlier timestamp with LT should succeed
            const response2 = await db.expireAt(key, earlierTimestamp, 'LT');
            expect(response2.success).toBe(true);
            expect(response2.data.result).toEqual(true);
        });
    });

    describe('ExpireTimeCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return timestamp when key has expiry set', async () => {
            const key = 'testKey';
            await db.set(key, 'value');
            const expireAt = Math.floor(Date.now() / 1000) + 100;
            await db.expireAt(key, expireAt);

            const response = await db.expireTime(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(BigInt(expireAt));
        });

        it('should return -1n when key exists but has no expiry', async () => {
            const key = 'testKey';
            await db.set(key, 'value');

            const response = await db.expireTime(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(-1n);
        });

        it('should return -2n when key does not exist', async () => {
            const key = 'nonExistentKey';
            const response = await db.expireTime(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(-2n);
        });
    });

    describe('FlushDBCommand', () => {
        beforeEach(async () => {
            await db.flushDB();

            // Setup multiple keys to test flushing
            await db.set('key1', 'value1');
            await db.set('key2', 'value2');
            await db.hSet('hash1', { field1: 'value1' });
        });

        it('should remove all keys from the database', async () => {
            // First verify keys exist
            const exists1 = await db.exists('key1', 'key2', 'hash1');
            expect(exists1.success).toBe(true);
            expect(exists1.data.result).toEqual(3n);

            // Flush the database
            const response = await db.flushDB();
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('OK');

            // Verify all keys are gone
            const exists2 = await db.exists('key1', 'key2', 'hash1');
            expect(exists2.success).toBe(true);
            expect(exists2.data.result).toEqual(0n);
        });

        it('should return OK even when database is empty', async () => {
            // First flush to ensure DB is empty
            await db.flushDB();

            // Try flushing again
            const response = await db.flushDB();
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('OK');
        });
    });

    describe('GetCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return the value of an existing key', async () => {
            const key = 'testKey';
            const value = 'testValue';
            await db.set(key, value);

            const response = await db.get(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(value);
        });

        it('should return empty string for a non-existent key', async () => {
            const key = 'nonExistentKey';
            const response = await db.get(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('');
        });

        it('should handle numeric values correctly', async () => {
            const key = 'testKey';
            const value = 42;
            await db.set(key, value);

            const response = await db.get(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(String(value));
        });
    });

    describe('GetAndDeleteCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should get and delete the value of an existing key', async () => {
            const key = 'testKey';
            const value = 'testValue';
            await db.set(key, value);

            const response = await db.getAndDelete(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(value);

            // Verify key was deleted
            const exists = await db.exists(key);
            expect(exists.data.result).toEqual(0n);
        });

        it('should return empty string for a non-existent key', async () => {
            const key = 'nonExistentKey';
            const response = await db.getAndDelete(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('');
        });

        it('should retrieve and delete numeric values as strings', async () => {
            const key = 'testKey';
            const value = 42;
            await db.set(key, value);

            const response = await db.getAndDelete(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('42');

            // Verify key was deleted
            const exists = await db.exists(key);
            expect(exists.data.result).toEqual(0n);
        });
    });

    describe('GetAndSetExpiryCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should get value and set expiry in seconds', async () => {
            const key = 'testKey';
            const value = 'testValue';
            await db.set(key, value);

            const response = await db.getAndSetExpiry(key, { ex: 100 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(value);

            // Verify expiry was set
            const expireTime = await db.expireTime(key);
            expect(Number(expireTime.data.result)).toBeGreaterThan(0);
        });

        it('should get value and set expiry in milliseconds', async () => {
            const key = 'testKey';
            const value = 'testValue';
            await db.set(key, value);

            const response = await db.getAndSetExpiry(key, { px: 100000 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(value);

            // Verify expiry was set
            const expireTime = await db.expireTime(key);
            expect(Number(expireTime.data.result)).toBeGreaterThan(0);
        });

        it('should get value and set expiry at timestamp', async () => {
            const key = 'testKey';
            const value = 'testValue';
            await db.set(key, value);
            const futureTimestamp = Math.floor(Date.now() / 1000) + 100;

            const response = await db.getAndSetExpiry(key, {
                ex_at: futureTimestamp,
            });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(value);

            // Verify expiry was set
            const expireTime = await db.expireTime(key);
            expect(expireTime.data.result).toEqual(BigInt(futureTimestamp));
        });

        it('should get value and remove expiry with persist option', async () => {
            const key = 'testKey';
            const value = 'testValue';
            await db.set(key, value);
            await db.expire(key, 100);

            const response = await db.getAndSetExpiry(key, { persist: true });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(value);

            // Verify expiry was removed
            const expireTime = await db.expireTime(key);
            expect(expireTime.data.result).toEqual(-1n);
        });

        it('should return empty string for non-existent key', async () => {
            const key = 'nonExistentKey';
            const response = await db.getAndSetExpiry(key, { ex: 100 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('');
        });

        it('should handle numeric values correctly', async () => {
            const key = 'testKey';
            const value = 42;
            await db.set(key, value);

            const response = await db.getAndSetExpiry(key, { ex: 100 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('42');

            // Verify expiry was set
            const expireTime = await db.expireTime(key);
            expect(Number(expireTime.data.result)).toBeGreaterThan(0);
        });
    });

    describe('GetSetCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should set new value and return old value', async () => {
            const key = 'testKey';
            const oldValue = 'oldValue';
            const newValue = 'newValue';
            await db.set(key, oldValue);

            const response = await db.getSet(key, newValue);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(oldValue);

            // Verify new value was set
            const get = await db.get(key);
            expect(get.data.result).toEqual(newValue);
        });

        it('should return empty string for non-existent key', async () => {
            const key = 'nonExistentKey';
            const value = 'newValue';
            const response = await db.getSet(key, value);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('');

            // Verify value was set
            const get = await db.get(key);
            expect(get.data.result).toEqual(value);
        });

        it('should handle numeric values correctly', async () => {
            const key = 'testKey';
            const oldValue = 42;
            const newValue = 84;
            await db.set(key, oldValue);

            const response = await db.getSet(key, newValue);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('42');

            // Verify new value was set
            const get = await db.get(key);
            expect(get.data.result).toEqual('84');
        });
    });

    describe('GetWatchCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return a stream when watching a key', async (): Promise<void> => {
            const key = 'testKey';
            const stream = await db.getWatch(key);

            expect(stream).toBeInstanceOf(Readable);

            return new Promise((resolve, reject) => {
                stream.once('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    stream.destroy();
                    resolve();
                });

                stream.once('error', reject);
            });
        });

        it('should receive updates through the stream', async (): Promise<void> => {
            const key = 'testKey';
            const stream = await db.getWatch(key);

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // wait for newValue to be returned from server and then resolve
                    if (data.data.result === 'newValue') {
                        stream.destroy();
                        resolve();
                    }
                });

                db.set(key, 'newValue').catch(reject);
            });
        });
    });

    describe('HGetCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return the value of an existing hash field', async () => {
            const key = 'hashKey';
            const field = 'name';
            const value = 'testValue';
            await db.hSet(key, { [field]: value });

            const response = await db.hGet(key, field);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(value);
        });

        it('should return empty string for a non-existent field', async () => {
            const key = 'hashKey';
            const field = 'nonexistent';
            await db.hSet(key, { otherField: 'value' });

            const response = await db.hGet(key, field);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('');
        });

        it('should return empty string for a non-existent key', async () => {
            const key = 'nonexistentHash';
            const field = 'someField';

            const response = await db.hGet(key, field);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('');
        });

        it('should handle numeric values correctly', async () => {
            const key = 'hashKey';
            const field = 'age';
            const value = 42;
            await db.hSet(key, { [field]: value });

            const response = await db.hGet(key, field);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('42');
        });

        it('should return error for wrong type operation', async () => {
            const key = 'stringKey';
            const field = 'someField';
            await db.set(key, 'string value');

            const response = await db.hGet(key, field);
            expect(response.success).toBe(false);
            expect(response.error).toContain('wrongtype operation');
        });
    });

    describe('HGetWatchCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return a stream when watching a hash field', async (): Promise<void> => {
            const key = 'hashKey';
            const field = 'name';
            const stream = await db.hGetWatch(key, field);

            expect(stream).toBeInstanceOf(Readable);

            return new Promise((resolve, reject) => {
                stream.once('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    stream.destroy();
                    resolve();
                });

                stream.once('error', reject);
            });
        });

        it('should receive updates through the stream', async (): Promise<void> => {
            const key = 'hashKey';
            const field = 'name';
            const stream = await db.hGetWatch(key, field);

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // wait for newValue to be returned from server and then resolve
                    if (data.data.result === 'newValue') {
                        stream.destroy();
                        resolve();
                    }
                });

                db.hSet(key, { [field]: 'newValue' }).catch(reject);
            });
        });
    });

    describe('HGetAllCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return all fields and values of a hash', async () => {
            const key = 'hashKey';
            const hash = {
                name: 'testName',
                age: '25',
                city: 'testCity',
            };
            await db.hSet(key, hash);

            const response = await db.hGetAll(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(
                new Map(Object.entries(hash)),
            );
        });

        it('should return empty object for non-existent key', async () => {
            const key = 'nonexistentHash';
            const response = await db.hGetAll(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(new Map());
        });

        it('should handle numeric values correctly', async () => {
            const key = 'hashKey';
            await db.hSet(key, {
                int: 42,
                float: 3.14,
                string: 'text',
            });

            const response = await db.hGetAll(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(
                new Map(
                    Object.entries({
                        int: '42',
                        float: '3.14',
                        string: 'text',
                    }),
                ),
            );
        });
    });

    describe('HGetAllWatchCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return a stream when watching a hash', async (): Promise<void> => {
            const key = 'newHashKey';
            const stream = await db.hGetAllWatch(key);

            expect(stream).toBeInstanceOf(Readable);

            return new Promise((resolve, reject) => {
                stream.once('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    stream.destroy();
                    resolve();
                });

                stream.once('error', reject);
            });
        });

        it('should receive updates through the stream', async (): Promise<void> => {
            const key = 'newHashKey';
            const stream = await db.hGetAllWatch(key);
            const hash = {
                name: 'testName',
                age: '25',
                city: 'testCity',
            };

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // wait for newValue to be returned from server and then resolve
                    if (data.data.result?.size > 0) {
                        expect(data.data.result).toEqual(
                            new Map(Object.entries(hash)),
                        );
                        stream.destroy();
                        resolve();
                    }
                });

                db.hSet(key, hash).catch(reject);
            });
        });
    });

    describe('HSetCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should set multiple fields in a hash and return count of new fields', async () => {
            const key = 'hashKey';
            const hash = {
                name: 'testName',
                age: 25,
                city: 'testCity',
            };

            const response = await db.hSet(key, hash);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(3n);

            // Verify fields were set correctly
            const getResponse = await db.hGetAll(key);
            expect(getResponse.data.result).toEqual(
                new Map(
                    Object.entries({
                        name: 'testName',
                        age: '25',
                        city: 'testCity',
                    }),
                ),
            );
        });

        it('should set multiple fields in a hash via map and return count of new fields', async () => {
            const key = 'hashKey';
            const hash = new Map(
                Object.entries({
                    name: 'testName',
                    age: '25',
                    city: 'testCity',
                }),
            );

            const response = await db.hSet(key, hash);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(3n);

            // Verify fields were set correctly
            const getResponse = await db.hGetAll(key);
            expect(getResponse.data.result).toEqual(hash);
        });

        it('should update existing fields and return count of new fields only', async () => {
            const key = 'hashKey';
            // First set
            await db.hSet(key, {
                name: 'testName',
                age: 25,
            });

            // Update existing and add new
            const response = await db.hSet(key, {
                name: 'newName', // update existing
                age: 30, // update existing
                city: 'testCity', // new field
            });

            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(1n); // only one new field

            // Verify all fields
            const getResponse = await db.hGetAll(key);
            expect(getResponse.data.result).toEqual(
                new Map(
                    Object.entries({
                        name: 'newName',
                        age: '30',
                        city: 'testCity',
                    }),
                ),
            );
        });

        it('should return error for wrong type operation', async () => {
            const key = 'stringKey';
            await db.set(key, 'string value');

            const response = await db.hSet(key, { field: 'value' });
            expect(response.success).toBe(false);
            expect(response.error).toContain('wrongtype operation');
        });
    });

    describe('IncrementCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should increment the value of a key by 1', async () => {
            const key = 'testKey';
            await db.set(key, 10);

            const response = await db.increment(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(11n);
        });

        it('should initialize to 1 if key does not exist', async () => {
            const key = 'nonExistentKey';
            const response = await db.increment(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(1n);
        });

        it('should return error for wrong type operation', async () => {
            const key = 'testKey';
            await db.set(key, 'not-a-number');

            const response = await db.increment(key);
            expect(response.success).toBe(false);
            expect(response.error).toContain('wrongtype operation');
        });
    });

    describe('IncrementByCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should increment the value of a key by specified amount', async () => {
            const key = 'testKey';
            await db.set(key, 10);

            const response = await db.incrementBy(key, 5);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(15n);
        });

        it('should initialize to delta if key does not exist', async () => {
            const key = 'nonExistentKey';
            const response = await db.incrementBy(key, 5);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(5n);
        });

        it('should handle negative delta values', async () => {
            const key = 'testKey';
            await db.set(key, 10);

            const response = await db.incrementBy(key, -3);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(7n);
        });

        it('should return error for wrong type operation', async () => {
            const key = 'testKey';
            await db.set(key, 'not-a-number');

            const response = await db.incrementBy(key, 5);
            expect(response.success).toBe(false);
            expect(response.error).toContain('wrongtype operation');
        });
    });

    describe('PingCommand', () => {
        it('should return PONG when no message is provided', async () => {
            const response = await db.ping();
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('PONG');
        });

        it('should echo back the provided message with a PONG', async () => {
            const message = 'Hello DiceDB!';
            const response = await db.ping(message);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(`PONG ${message}`);
        });
    });

    describe('SetCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should set a simple string value', async () => {
            const key = 'testKey';
            const value = 'testValue';

            const response = await db.set(key, value);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('OK');

            // Verify value was set
            const get = await db.get(key);
            expect(get.data.result).toEqual(value);
        });

        it('should set a numeric value', async () => {
            const key = 'testKey';
            const value = 42;

            const response = await db.set(key, value);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('OK');

            // Verify value was set
            const get = await db.get(key);
            expect(get.data.result).toEqual('42');
        });

        it('should set with expiry in seconds with EX', async () => {
            const key = 'testKey';
            const value = 'expiring';

            const response = await db.set(key, value, { ex: 100 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('OK');

            // Verify expiry was set
            const ttl = await db.expireTime(key);
            expect(Number(ttl.data.result)).toBeGreaterThan(0);
        });

        it('should set with expiry in milliseconds with PX', async () => {
            const key = 'testKey';
            const value = 'expiring';

            const response = await db.set(key, value, { px: 1000000 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('OK');

            // Verify expiry was set
            const ttl = await db.expireTime(key);
            expect(Number(ttl.data.result)).toBeGreaterThan(0);
        });

        it('should set with expiry at timestamp with EXAT', async () => {
            const key = 'testKey';
            const value = 'expiringAt';
            const timestamp = Math.floor(Date.now() / 1000) + 100;

            const response = await db.set(key, value, { ex_at: timestamp });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('OK');

            // Verify expiry was set
            const ttl = await db.expireTime(key);
            expect(ttl.data.result).toEqual(BigInt(timestamp));
        });

        it('should set with expiry at timestamp with PXAT', async () => {
            const key = 'testKey';
            const value = 'expiringAt';
            const timestamp = Date.now() + 10000;

            const response = await db.set(key, value, { px_at: timestamp });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('OK');

            // Verify expiry was set
            const ttl = await db.expireTime(key);
            expect(ttl.data.result).toEqual(
                BigInt(Math.floor(timestamp / 1000)),
            );
        });

        it('should not set if key exists with XX option', async () => {
            const key = 'testKey';
            const initialValue = 'initial';
            const newValue = 'new';

            // First set should succeed
            await db.set(key, initialValue);

            // Set with XX should succeed since key exists
            const response1 = await db.set(key, newValue, { xx: true });
            expect(response1.success).toBe(true);
            expect(response1.data.result).toEqual('OK');

            // Get value to verify it was updated
            const get1 = await db.get(key);
            expect(get1.data.result).toEqual(newValue);

            // Try setting non-existent key with XX
            const response2 = await db.set('nonexistentKey', 'value', {
                xx: true,
            });
            expect(response2.success).toBe(true);

            // Verify key wasn't set
            const get2 = await db.get('nonexistentKey');
            expect(get2.data.result).toEqual('');
        });

        it('should not set if key does not exist with NX option', async () => {
            const key = 'testKey';
            const initialValue = 'initial';
            const newValue = 'new';

            // Set with NX should succeed since key doesn't exist
            const response1 = await db.set(key, initialValue, { nx: true });
            expect(response1.success).toBe(true);
            expect(response1.data.result).toEqual('OK');

            // Get value to verify it was set
            const get1 = await db.get(key);
            expect(get1.data.result).toEqual(initialValue);

            // Second set with NX should fail since key exists
            const response2 = await db.set(key, newValue, { nx: true });
            expect(response2.success).toBe(true);

            // Verify value wasn't changed
            const get2 = await db.get(key);
            expect(get2.data.result).toEqual(initialValue);
        });

        it('should keep existing TTL with keepTTL option even with expiry', async () => {
            const key = 'testKey';
            const initialValue = 'initial';
            const newValue = 'new';

            // Set with expiry
            await db.set(key, initialValue, { ex: 100 });
            const initialTTL = await db.expireTime(key);

            // Update value keeping TTL
            const response = await db.set(key, newValue, {
                keepTTL: true,
                ex: 10000,
            });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('OK');

            // Verify TTL is unchanged
            const currentTTL = await db.expireTime(key);
            expect(currentTTL.data.result).toEqual(initialTTL.data.result);
        });
    });

    describe('TTLCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return remaining TTL for key with expiry', async () => {
            const key = 'testKey';
            const value = 'testValue';
            await db.set(key, value, { ex: 100 });

            const response = await db.ttl(key);
            expect(response.success).toBe(true);
            expect(Number(response.data.result)).toBeGreaterThan(0);
            expect(Number(response.data.result)).toBeLessThanOrEqual(100);
        });

        it('should return -2 for non-existent key', async () => {
            const key = 'nonexistentKey';
            const response = await db.ttl(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(-2n);
        });

        it('should return -1 for key with no expiry', async () => {
            const key = 'persistentKey';
            const value = 'value';
            await db.set(key, value);

            const response = await db.ttl(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(-1n);
        });
    });

    describe('TypeCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return "string" for string values', async () => {
            const key = 'stringKey';
            const value = 'testValue';
            await db.set(key, value);

            const response = await db.type(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('string');
        });

        it('should return "int" for integers', async () => {
            const key = 'integer';
            await db.set(key, 256);

            const response = await db.type(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('int');
        });

        it('should return "none" for non-existent keys', async () => {
            const key = 'nonexistentKey';
            const response = await db.type(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('none');
        });
    });

    describe('UnwatchCommand', () => {
        let watchStream: Readable;

        beforeEach(async () => {
            try {
                await db.flushDB();
                watchStream?.destroy();
            } catch {
                // Ignore error if keys don't exist or stream is already closed
            }
        });

        afterEach(() => {
            if (watchStream) {
                watchStream.destroy();
            }
        });

        it('should stop watching a key when unwatched', async () => {
            const key = 'watchKey';
            watchStream = await db.getWatch(key);

            const fingerprint: string = await new Promise((resolve) => {
                watchStream.once('data', (data) => {
                    resolve(data.data.meta.fingerprint);
                });
            });

            // Unwatch the key
            const response = await db.unwatch(fingerprint);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('OK');

            // Verify stream is ended
            // expect(watchStream.destroyed).toBe(true);
        });

        it('should handle unwatching non-existent subscription', async () => {
            const response = await db.unwatch('nonexistent-fingerprint');
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual('OK');
        });
    });

    describe('ZAddCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should add new members to a sorted set', async () => {
            const key = 'zsetKey';

            const response = await db.zAdd(key, { member1: 100, member2: 200 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(2n); // Two new members added
        });

        it('should add new members to a sorted set via a map', async () => {
            const key = 'zsetKey';

            const response = await db.zAdd(
                key,
                new Map(Object.entries({ member1: 100, member2: 200 })),
            );
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(2n); // Two new members added
        });

        it('should update scores of existing members', async () => {
            const key = 'zsetKey';
            // First add
            await db.zAdd(key, { member1: 100, member2: 200 });

            // Update scores
            const response = await db.zAdd(key, {
                member1: 150, // Update
                member2: 250, // Update
                member3: 300, // New
            });

            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(1n); // Only one new member
        });

        it('should only add new members with NX option', async () => {
            const key = 'zsetKey';
            // First add
            await db.zAdd(key, { member1: 100, member2: 200 });

            // Try adding new and updating existing with NX
            const response = await db.zAdd(
                key,
                {
                    member1: 150, // Should not update
                    member2: 250, // Should not update
                    member3: 300, // Should add
                },
                { nx: true },
            );

            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(1n); // Only one new member added
        });

        it('should only update existing members with XX option', async () => {
            const key = 'zsetKey';
            // First add
            await db.zAdd(key, { member1: 100, member2: 200 });

            // Try adding new and updating existing with XX
            const response = await db.zAdd(
                key,
                {
                    member1: 150, // Should update
                    member2: 250, // Should update
                    member3: 300, // Should not add
                },
                { xx: true, ch: true },
            );

            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(2n); // Only two members updated
        });

        it('should update only if new score is greater with GT option', async () => {
            const key = 'zsetKey';
            // First add
            await db.zAdd(key, { member1: 100, member2: 200 });

            // Try updating with GT
            const response = await db.zAdd(
                key,
                {
                    member1: 150, // Should update (150 > 100)
                    member2: 150, // Should not update (150 < 200)
                },
                { gt: true, ch: true },
            );

            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(1n); // 1 updated member
        });

        it('should update only if new score is less with LT option', async () => {
            const key = 'zsetKey';
            // First add
            await db.zAdd(key, { member1: 100, member2: 200 });

            // Try updating with LT
            const response = await db.zAdd(
                key,
                {
                    member1: 50, // Should update (50 < 100)
                    member2: 250, // Should not update (250 > 200)
                },
                { lt: true, ch: true },
            );

            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(1n); // 1 updated member
        });

        it('should return count of changed elements with CH option', async () => {
            const key = 'zsetKey';
            // First add
            await db.zAdd(key, { member1: 100, member2: 200 });

            // Update existing and add new with CH
            const response = await db.zAdd(
                key,
                {
                    member1: 150, // Changed
                    member2: 250, // Changed
                    member3: 300, // New
                },
                { ch: true },
            );

            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(3n); // 2 updates + 1 new
        });

        it('should increment score with INCR option', async () => {
            const key = 'zsetKey';
            // First add
            await db.zAdd(key, { member1: 100 });

            // Increment score
            const response = await db.zAdd(
                key,
                {
                    member1: 50, // Add 50 to existing score
                },
                { incr: true },
            );

            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(150n); // New score after increment
        });

        it('should throw error when using INCR with multiple members', async () => {
            const key = 'zsetKey';

            try {
                await db.zAdd(
                    key,
                    {
                        member1: 50,
                        member2: 100,
                    },
                    { incr: true },
                );
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toContain(
                        'INCR option can only be used with a single member',
                    );
                }
            }
        });

        it('should throw error when using INCR with GT/LT', async () => {
            const key = 'zsetKey';

            try {
                await db.zAdd(key, { member1: 50 }, { incr: true, gt: true });
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toContain(
                        'INCR option cannot be used with the GT or LT options',
                    );
                }
            }
        });
    });

    describe('ZCardCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return the number of members in a sorted set', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 100,
                member2: 200,
                member3: 300,
            });

            const response = await db.zCard(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(3n);
        });

        it('should return 0 for non-existent key', async () => {
            const key = 'nonexistentKey';
            const response = await db.zCard(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(0n);
        });

        it('should return 0 for empty sorted set', async () => {
            const key = 'emptySet';
            // An empty sorted set is the same as a non-existent key
            const response = await db.zCard(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(0n);
        });

        it('should return error for wrong type', async () => {
            const key = 'stringKey';
            await db.set(key, 'value');

            const response = await db.zCard(key);
            expect(response.success).toBe(false);
            expect(response.error).toContain('wrongtype operation');
        });
    });

    describe('ZCountCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should count elements with scores within range', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
                member4: 40,
                member5: 50,
            });

            const response = await db.zCount(key, { min: 20, max: 40 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(3n); // member2, member3, member4
        });

        it('should count all elements when no range specified', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            const response = await db.zCount(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(3n); // all members
        });

        it('should handle infinity bounds', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            // Count from -inf to 20
            const response1 = await db.zCount(key, { max: 20 });
            expect(response1.success).toBe(true);
            expect(response1.data.result).toEqual(2n); // member1, member2

            // Count from 20 to +inf
            const response2 = await db.zCount(key, { min: 20 });
            expect(response2.success).toBe(true);
            expect(response2.data.result).toEqual(2n); // member2, member3
        });

        it('should return 0 for empty ranges', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            const response = await db.zCount(key, { min: 15, max: 15 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(0n); // no members with score exactly 15
        });

        it('should return 0 for non-existent key', async () => {
            const key = 'nonexistentKey';
            const response = await db.zCount(key, { min: 0, max: 100 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(0n);
        });

        it('should return error for wrong type', async () => {
            const key = 'stringKey';
            await db.set(key, 'value');

            const response = await db.zCount(key);
            expect(response.success).toBe(false);
            expect(response.error).toContain('wrongtype operation');
        });
    });

    describe('ZPopMaxCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should remove and return member with highest score by default', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            const response = await db.zPopMax(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(
                new Map(Object.entries({ member3: 30n })),
            );

            // Verify member was removed
            const card = await db.zCard(key);
            expect(card.data.result).toEqual(2n);
        });

        it('should remove and return multiple members when count specified', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
                member4: 40,
                member5: 50,
            });

            const response = await db.zPopMax(key, 3);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(
                new Map(
                    Object.entries({
                        member5: 50n,
                        member4: 40n,
                        member3: 30n,
                    }),
                ),
            );

            // Verify members were removed
            const card = await db.zCard(key);
            expect(card.data.result).toEqual(2n);
        });

        it('should return empty object for non-existent key', async () => {
            const key = 'nonexistentKey';
            const response = await db.zPopMax(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(new Map());
        });

        it('should return all members when count exceeds set size', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            const response = await db.zPopMax(key, 5);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(
                new Map(
                    Object.entries({
                        member3: 30n,
                        member2: 20n,
                        member1: 10n,
                    }),
                ),
            );

            // Verify all members were removed
            const card = await db.zCard(key);
            expect(card.data.result).toEqual(0n);
        });

        it('should throw error for invalid count', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, { member1: 10 });

            try {
                await db.zPopMax(key, 0);
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toContain('count must be >= 1!');
                }
            }

            try {
                await db.zPopMax(key, -1);
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toContain('count must be >= 1');
                }
            }
        });

        it('should return error for wrong type', async () => {
            const key = 'stringKey';
            await db.set(key, 'value');

            const response = await db.zPopMax(key);
            expect(response.success).toBe(false);
            expect(response.error).toContain('wrongtype operation');
        });
    });

    describe('ZPopMinCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should remove and return member with lowest score by default', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            const response = await db.zPopMin(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(
                new Map(Object.entries({ member1: 10n })),
            );

            // Verify member was removed
            const card = await db.zCard(key);
            expect(card.data.result).toEqual(2n);
        });

        it('should remove and return multiple members when count specified', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
                member4: 40,
                member5: 50,
            });

            const response = await db.zPopMin(key, 3);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(
                new Map(
                    Object.entries({
                        member1: 10n,
                        member2: 20n,
                        member3: 30n,
                    }),
                ),
            );

            // Verify members were removed
            const card = await db.zCard(key);
            expect(card.data.result).toEqual(2n);
        });

        it('should return empty map for non-existent key', async () => {
            const key = 'nonexistentKey';
            const response = await db.zPopMin(key);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(new Map());
        });

        it('should return all members when count exceeds set size', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            const response = await db.zPopMin(key, 5);
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(
                new Map(
                    Object.entries({
                        member1: 10n,
                        member2: 20n,
                        member3: 30n,
                    }),
                ),
            );

            // Verify all members were removed
            const card = await db.zCard(key);
            expect(card.data.result).toEqual(0n);
        });

        it('should throw error for invalid count', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, { member1: 10 });

            try {
                await db.zPopMin(key, 0);
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toContain('count must be >= 1');
                }
            }

            try {
                await db.zPopMin(key, -1);
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toContain('count must be >= 1');
                }
            }
        });

        it('should return error for wrong type', async () => {
            const key = 'stringKey';
            await db.set(key, 'value');

            const response = await db.zPopMin(key);
            expect(response.success).toBe(false);
            expect(response.error).toContain('wrongtype operation');
        });
    });

    describe('ZRankCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return rank of member in sorted set', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
                member4: 40,
            });

            const response = await db.zRank(key, 'member2');
            expect(response.success).toBe(true);
            expect(response.data.result.rank).toEqual(2n);
            expect(response.data.result.element).toEqual(
                new Map([['member2', 20n]]),
            );
        });

        it('should return 0 rank and 0 score for non-existent member', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
            });

            const response = await db.zRank(key, 'nonexistent');
            expect(response.success).toBe(true);
            expect(response.data.result.element.size).toEqual(1);
            expect(response.data.result.rank).toEqual(0n); // Rank is 0 for non-existent member
            expect(response.data.result.element.get('nonexistent')).toEqual(
                0n, // Score is 0 for non-existent member
            );
        });

        it('should return 0 score and undefined member for non-existent key', async () => {
            const key = 'nonexistentKey';
            const response = await db.zRank(key, 'member1');
            expect(response.success).toBe(true);
            expect(response.data.result.rank).toEqual(0n); // Rank is 0 for non-existent member
            expect(response.data.result.element).toBe(undefined); // No member foun)d
        });

        it('should handle members with same score', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 20, // Same score as member2
                member4: 30,
            });

            const response1 = await db.zRank(key, 'member2');
            const response2 = await db.zRank(key, 'member3');
            expect(response1.success).toBe(true);
            expect(response2.success).toBe(true);
            // With same scores, order is lexicographical by member name
            expect(response1.data.result.rank).toEqual(2n);
            expect(response2.data.result.rank).toEqual(3n);
        });

        it('should return error for wrong type', async () => {
            const key = 'stringKey';
            await db.set(key, 'value');

            const response = await db.zRank(key, 'member1');
            expect(response.success).toBe(false);
            expect(response.error).toContain('wrongtype operation');
        });
    });

    describe('ZRangeCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return members within score range in ascending order', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
                member4: 40,
                member5: 50,
            });

            const response = await db.zRange(key, { start: 1, stop: 3 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(
                new Map(
                    Object.entries({
                        member1: 10n,
                        member2: 20n,
                        member3: 30n,
                    }),
                ),
            );
        });

        it('should return all members when range covers entire set', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            const response = await db.zRange(key, { start: 1, stop: 3 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(
                new Map(
                    Object.entries({
                        member1: 10n,
                        member2: 20n,
                        member3: 30n,
                    }),
                ),
            );
        });

        it('should return empty map for non-existent key', async () => {
            const key = 'nonexistentKey';
            const response = await db.zRange(key, { start: 0, stop: 10 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(new Map());
        });

        it('should return empty map when start is greater than set size', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            const response = await db.zRange(key, { start: 40, stop: 50 });
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(new Map());
        });

        it('should throw error when stop is less than start', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, { member1: 10 });

            try {
                await db.zRange(key, { start: 2, stop: 1 });
            } catch (error) {
                if (error instanceof Error) {
                    expect(error.message).toContain('stop must be >= 2');
                }
            }
        });

        it('should return error for wrong type', async () => {
            const key = 'stringKey';
            await db.set(key, 'value');

            const response = await db.zRange(key, { start: 0, stop: 1 });
            expect(response.success).toBe(false);
            expect(response.error).toContain('wrongtype operation');
        });
    });

    describe('ZRemCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should remove single member from sorted set', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            const response = await db.zRem(key, 'member2');
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(1n); // 1 member removed

            // Verify member was removed
            const card = await db.zCard(key);
            expect(card.data.result).toEqual(2n);
        });

        it('should remove multiple members from sorted set', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
                member4: 40,
            });

            const response = await db.zRem(
                key,
                'member1',
                'member3',
                'member4',
            );
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(3n); // 3 members removed

            // Verify members were removed
            const card = await db.zCard(key);
            expect(card.data.result).toEqual(1n);
        });

        it('should return 0 for non-existent members', async () => {
            const key = 'zsetKey';
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
            });

            const response = await db.zRem(key, 'nonexistent1', 'nonexistent2');
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(0n);

            // Verify no members were removed
            const card = await db.zCard(key);
            expect(card.data.result).toEqual(2n);
        });

        it('should return 0 for non-existent key', async () => {
            const key = 'nonexistentKey';
            const response = await db.zRem(key, 'member1');
            expect(response.success).toBe(true);
            expect(response.data.result).toEqual(0n);
        });

        it('should return error for wrong type', async () => {
            const key = 'stringKey';
            await db.set(key, 'value');

            const response = await db.zRem(key, 'member1');
            expect(response.success).toBe(false);
            expect(response.error).toContain('wrongtype operation');
        });
    });

    describe('ZCardWatchCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return a stream when watching a sorted set cardinality', async (): Promise<void> => {
            const key = 'zsetKey1';
            const stream = await db.zCardWatch(key);

            expect(stream).toBeInstanceOf(Readable);

            return new Promise((resolve, reject) => {
                stream.once('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);
                    expect(data.data.result).toEqual(0n); // Initial cardinality should be 0

                    stream.destroy();
                    resolve();
                });

                stream.once('error', reject);
            });
        });

        it('should receive updates through the stream when members are added', async (): Promise<void> => {
            const key = 'zsetKey2';
            const stream = await db.zCardWatch(key);

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // After we see cardinality of 2, we're done
                    if (data.data.result === 2n) {
                        stream.destroy();
                        resolve();
                    }
                });

                // Add members one by one to see cardinality updates
                Promise.resolve()
                    .then(() => db.zAdd(key, { member1: 10 }))
                    .then(() => db.zAdd(key, { member2: 20 }))
                    .catch(reject);
            });
        });

        it('should receive updates through the stream when members are removed', async (): Promise<void> => {
            const key = 'zsetKey3';

            // First add some members
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            const stream = await db.zCardWatch(key);

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // After we see cardinality of 1, we're done
                    if (data.data.result === 1n) {
                        stream.destroy();
                        resolve();
                    }
                });

                // Remove members one by one to see cardinality updates
                Promise.resolve()
                    .then(() => db.zRem(key, 'member1'))
                    .then(() => db.zRem(key, 'member2'))
                    .catch(reject);
            });
        });
    });

    describe('ZCountWatchCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return a stream when watching a sorted set count', async (): Promise<void> => {
            const key = 'zsetKey4';
            const stream = await db.zCountWatch(key, { min: 0, max: 100 });

            expect(stream).toBeInstanceOf(Readable);

            return new Promise((resolve, reject) => {
                stream.once('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);
                    expect(data.data.result).toEqual(0n); // Initial count should be 0

                    stream.destroy();
                    resolve();
                });

                stream.once('error', reject);
            });
        });

        it('should receive updates through the stream when members are added within range', async (): Promise<void> => {
            const key = 'zsetKey5';
            const stream = await db.zCountWatch(key, { min: 0, max: 50 });

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);
                    // After we see count of 2, we're done
                    if (data.data.result === 2n) {
                        stream.destroy();
                        resolve();
                    }
                });

                // Add members one by one to see count updates
                Promise.resolve()
                    .then(() => db.zAdd(key, { member1: 10 })) // Within range
                    .then(() => db.zAdd(key, { member2: 30 })) // Within range
                    .then(() => db.zAdd(key, { member3: 60 })) // Outside range
                    .catch(reject);
            });
        });

        it('should receive updates when members are removed affecting the count', async (): Promise<void> => {
            const key = 'zsetKey6';

            // First add some members
            await db.zAdd(key, {
                member1: 10, // In range
                member2: 30, // In range
                member3: 60, // Outside range
                member4: 40, // In range
            });

            const stream = await db.zCountWatch(key, { min: 0, max: 50 });

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // After we see count of 1, we're done
                    if (data.data.result === 1n) {
                        stream.destroy();
                        resolve();
                    }
                });

                // Remove members affecting the count
                Promise.resolve()
                    .then(() => db.zRem(key, 'member1'))
                    .then(() => db.zRem(key, 'member2'))
                    .catch(reject);
            });
        });

        it('should receive updates when member scores change affecting the count', async (): Promise<void> => {
            const key = 'zsetKey7';

            // First add some members
            await db.zAdd(key, {
                member1: 10, // Initially in range
                member2: 30, // Initially in range
            });

            const stream = await db.zCountWatch(key, { min: 0, max: 50 });

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // After count drops to 0, we're done
                    if (data.data.result === 0n) {
                        stream.destroy();
                        resolve();
                    }
                });

                // Update scores to move members out of range
                Promise.resolve()
                    .then(() => db.zAdd(key, { member1: 60 })) // Move out of range
                    .then(() => db.zAdd(key, { member2: 70 })) // Move out of range
                    .catch(reject);
            });
        });

        it('should handle infinity bounds correctly', async (): Promise<void> => {
            const key = 'zsetKey8';
            const stream = await db.zCountWatch(key);

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);
                    // After we see count of 2, we're done
                    if (data.data.result === 2n) {
                        stream.destroy();
                        resolve();
                    }
                });

                // Add members one by one to see count updates
                Promise.resolve()
                    .then(() => db.zAdd(key, { member1: 10 })) // Within range
                    .then(() => db.zAdd(key, { member2: 30 })) // Within range
                    .then(() => db.zAdd(key, { member3: 60 })) // Outside range
                    .catch(reject);
            });
        });
    });

    describe('ZRankWatchCommand', () => {
        beforeEach(async () => db.flushDB());

        it('should return a stream when watching a member rank', async (): Promise<void> => {
            const key = 'zsetKey9';
            const stream = await db.zRankWatch(key, 'member1');

            expect(stream).toBeInstanceOf(Readable);

            return new Promise((resolve, reject) => {
                stream.once('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);
                    expect(data.data.result.rank).toEqual(0n);
                    expect(data.data.result.element).toBe(undefined); // Initial stat)e

                    stream.destroy();
                    resolve();
                });

                stream.once('error', reject);
            });
        });

        it('should receive updates when watched member is added', async (): Promise<void> => {
            const key = 'zsetKey10';
            const stream = await db.zRankWatch(key, 'member2');

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // After member2 is added
                    if (data.data.result.rank === 2n) {
                        expect(data.data.result.rank).toEqual(2n);
                        expect(data.data.result.element).toEqual(
                            new Map([['member2', 20n]]),
                        );
                        stream.destroy();
                        resolve();
                    }
                });

                Promise.resolve()
                    .then(() => db.zAdd(key, { member1: 10 }))
                    .then(() => db.zAdd(key, { member2: 20 }))
                    .catch(reject);
            });
        });

        it('should receive updates when rank changes due to other members', async (): Promise<void> => {
            const key = 'zsetKey11';

            // First add the watched member
            await db.zAdd(key, { member2: 20 });

            const stream = await db.zRankWatch(key, 'member2');

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // After rank becomes 3, we're done
                    if (data.data.result?.rank === 3n) {
                        stream.destroy();
                        resolve();
                    }
                });

                // Add members with lower scores to change member2's rank
                Promise.resolve()
                    .then(() => db.zAdd(key, { member1: 10 }))
                    .then(() => db.zAdd(key, { member3: 15 }))
                    .catch(reject);
            });
        });

        it('should receive updates when watched member is removed', async (): Promise<void> => {
            const key = 'zsetKey12';

            // Set up initial sorted set
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            const stream = await db.zRankWatch(key, 'member2');

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // After member2 is removed
                    if (data.data.result.rank === 0n) {
                        expect(data.data.result.rank).toEqual(0n);
                        expect(data.data.result.element).toEqual(
                            new Map(Object.entries({ member2: 0n })),
                        );
                        stream.destroy();
                        resolve();
                    }
                });

                Promise.resolve()
                    .then(() => db.zRem(key, 'member2'))
                    .catch(reject);
            });
        });

        it('should receive updates when watched member score changes', async (): Promise<void> => {
            const key = 'zsetKey13';

            // Set up initial sorted set
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            const stream = await db.zRankWatch(key, 'member2');

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // After getting 3 rank updates
                    if (data.data.result?.rank === 3n) {
                        expect(data.data.result.rank).toEqual(3n);
                        expect(data.data.result.element).toEqual(
                            new Map([['member2', 35n]]),
                        );

                        stream.destroy();
                        resolve();
                    }
                });

                // Change member2's score to affect its rank
                Promise.resolve()
                    .then(() => db.zAdd(key, { member2: 5 })) // Should move to rank 1
                    .then(() => db.zAdd(key, { member2: 35 })) // Should move to rank 3
                    .catch(reject);
            });
        });

        it('should handle non-existent sorted set', async (): Promise<void> => {
            const key = 'nonExistentKeyForZRankWatch';
            const stream = await db.zRankWatch(key, 'member1');

            return new Promise((resolve, reject) => {
                stream.once('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);
                    expect(data.data.result.element).toBe(undefined);
                    expect(data.data.result.rank).toEqual(0n);

                    stream.destroy();
                    resolve();
                });

                stream.once('error', reject);
            });
        });
    });

    describe('ZRangeWatchCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete(
                    'zsetKey14',
                    'zsetKey15',
                    'zsetKey16',
                    'zsetKey17',
                    'zsetKey18',
                );
            } catch {
                // Ignore error if keys don't exist
            }
        });

        it('should return a stream when watching a score range', async (): Promise<void> => {
            const key = 'zsetKey14';
            const stream = await db.zRangeWatch(key, { start: 0, stop: 100 });

            expect(stream).toBeInstanceOf(Readable);

            return new Promise((resolve, reject) => {
                stream.once('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);
                    expect(data.data.result).toEqual(new Map()); // Initial empty state

                    stream.destroy();
                    resolve();
                });

                stream.once('error', reject);
            });
        });

        it('should receive updates when members are added within range', async (): Promise<void> => {
            const key = 'zsetKey15';
            const stream = await db.zRangeWatch(key, { start: 1, stop: 3 });

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // After we see all three members in range, we're done
                    if (data.data.result.size === 3) {
                        expect(data.data.result).toEqual(
                            new Map(
                                Object.entries({
                                    member1: 10n,
                                    member2: 20n,
                                    member3: 30n,
                                }),
                            ),
                        );
                        stream.destroy();
                        resolve();
                    }
                });

                // Add members one by one to see range updates
                Promise.resolve()
                    .then(() => db.zAdd(key, { member1: 10 })) // At lower bound
                    .then(() => db.zAdd(key, { member2: 20 })) // In middle
                    .then(() => db.zAdd(key, { member3: 30 })) // At upper bound
                    .then(() => db.zAdd(key, { member4: 40 })) // Outside range
                    .catch(reject);
            });
        });

        it('should receive updates when members are removed from range', async (): Promise<void> => {
            const key = 'zsetKey16';

            // First add some members
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
            });

            const stream = await db.zRangeWatch(key, { start: 1, stop: 3 });

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // After member2 is removed and we see only 2 members
                    if (
                        data.data.result.size === 2 &&
                        !data.data.result.has('member2')
                    ) {
                        expect(data.data.result).toEqual(
                            new Map(
                                Object.entries({
                                    member1: 10n,
                                    member3: 30n,
                                }),
                            ),
                        );
                        stream.destroy();
                        resolve();
                    }
                });

                // Remove member2 from the range
                Promise.resolve()
                    .then(() => db.zRem(key, 'member2'))
                    .catch(reject);
            });
        });

        it('should receive updates when member scores change affecting range', async (): Promise<void> => {
            const key = 'zsetKey17';

            // Set up initial sorted set
            await db.zAdd(key, {
                member1: 10,
                member2: 20,
                member3: 30,
                member4: 40,
            });

            const stream = await db.zRangeWatch(key, { start: 1, stop: 3 });

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);

                    // After member2's score is changed to be outside range
                    if (
                        data.data.result.size === 3 &&
                        !data.data.result.has('member2')
                    ) {
                        expect(data.data.result).toEqual(
                            new Map(
                                Object.entries({
                                    member1: 10n,
                                    member3: 30n,
                                    member4: 40n,
                                }),
                            ),
                        );
                        stream.destroy();
                        resolve();
                    }
                });

                // Change member2's score to move it outside range
                Promise.resolve()
                    .then(() => db.zAdd(key, { member2: 50 }))
                    .catch(reject);
            });
        });

        it('should handle non-existent sorted set', async (): Promise<void> => {
            const key = 'nonExistentKeyForZRangeWatch';
            const stream = await db.zRangeWatch(key, { start: 0, stop: 100 });

            return new Promise((resolve, reject) => {
                stream.once('data', (data) => {
                    expect(data.success).toBe(true);
                    expect(data.error).toBe(null);
                    expect(data.data.meta.watch).toBe(true);
                    expect(data.data.result).toEqual(new Map());

                    stream.destroy();
                    resolve();
                });

                stream.once('error', reject);
            });
        });
    });

    describe('KeysCommand', () => {
        beforeEach(async () => {
            try {
                // Clear any existing keys
                await db.flushDB();

                // Set up test data
                await db.set('user:1', 'John');
                await db.set('user:2', 'Jane');
                await db.set('post:1', 'Hello');
                await db.hSet('hash:1', { field1: 'value1' });
                await db.zAdd('zset:1', { member1: 10 });
            } catch {
                // Ignore errors during setup
            }
        });

        it('should return all keys matching exact pattern', async () => {
            const response = await db.keys('user:1');
            expect(response.success).toBe(true);
            expect(response.data.result).toHaveLength(1);
            expect(response.data.result).toContain('user:1');
        });

        it('should return all keys matching wildcard pattern *', async () => {
            const response = await db.keys('*');
            expect(response.success).toBe(true);
            expect(response.data.result).toHaveLength(5); // All test keys
            expect(response.data.result).toEqual(expect.arrayContaining([
                'user:1',
                'user:2',
                'post:1',
                'hash:1',
                'zset:1',
            ]));
        });

        it('should return all keys matching prefix pattern', async () => {
            const response = await db.keys('user:*');
            expect(response.success).toBe(true);
            expect(response.data.result).toHaveLength(2);
            expect(response.data.result).toEqual(expect.arrayContaining([
                'user:1',
                'user:2',
            ]));
        });

        it('should return all keys matching suffix pattern', async () => {
            const response = await db.keys('*:1');
            expect(response.success).toBe(true);
            expect(response.data.result).toHaveLength(4);
            expect(response.data.result).toEqual(expect.arrayContaining([
                'user:1',
                'post:1',
                'hash:1',
                'zset:1',
            ]));
        });

        it('should return all keys matching question mark pattern', async () => {
            const response = await db.keys('user:?');
            expect(response.success).toBe(true);
            expect(response.data.result).toHaveLength(2);
            expect(response.data.result).toEqual(expect.arrayContaining([
                'user:1',
                'user:2',
            ]));
        });

        it('should return empty array for non-matching pattern', async () => {
            const response = await db.keys('nonexistent:*');
            expect(response.success).toBe(true);
            expect(response.data.result).toHaveLength(0);
        });

        it('should return empty array when database is empty', async () => {
            await db.flushDB();
            const response = await db.keys('*');
            expect(response.success).toBe(true);
            expect(response.data.result).toHaveLength(0);
        });
    });

    it('should run all commands concurrently without error', async () => {
        const data = await Promise.allSettled([
            db.ping(),
            db.ping('Hey there!'),
            db.get('Hey'),
            db.get('Welcomes'),
            db.getSet('Hey', 'Hello'),
            db.decrement('test'),
            db.decrementBy('testing', -20),
            db.delete('delete', 'assas', 'sasa'),
            db.echo('hello there'),
            db.echo(''),
            db.echo(),
            db.exists('hello', 'testing', 'Hey', 'Hey'),
            db.expire('Hey', 10, 'NX'),
            db.expire('Hey', 2, 'XX'),
            db.expireAt('test', Date.now() + 60 * 60 * 1000, 'NX'),
            db.expireTime('test'),
            db.ttl('test'),
            db.getAndSetExpiry('test', { persist: true }),
            db.getAndDelete('test'),
            db.increment('test'),
            db.incrementBy('test', 500),
            db.type('test'),
            db.type('Welcomes'),
            db.unwatch('sddasdad'),
            db.set('name', 'Aditya'),
            db.set('age', 25),
            db.set('age', 29, { xx: true }),
            db.set('age', 29, { xx: true }),
            db.set('age', 302, { nx: true }),
            db.set('age', 302, { ex: 10 }),
            db.hSet('aditya', {
                name: 'Aditya',
                age: 25,
            }),
            db.flushDB(),
        ]);

        expect(data.every((d) => d.status === 'fulfilled' && d.value.success === true)).toBe(true);
    });

    afterAll(async () => {
        await db.disconnect();
    });
});
