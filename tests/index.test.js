import { expect } from 'chai';
import { describe, before, it, after, beforeEach } from 'mocha';

import DiceDB from '../dist/index.js';
import { Readable } from 'stream';

describe('DiceDB test cases', () => {
    let db;

    before(async () => {
        db = new DiceDB({
            host: 'localhost',
            port: 7379,
            conn_timout_ms: 5000,
            query_timeout_ms: 5000,
            idle_timeout_ms: 1000,
        });

        await db.connect();
    });

    describe('DecrementCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete('testKey');
                await db.delete('nonExistentKey');
            } catch {
                // Ignore error if key doesn't exist
            }
        });

        it('should decrement the value of a key by 1', async () => {
            const key = 'testKey';
            const setResult = await db.set(key, 10);
            expect(setResult.success).to.be.true;

            const response = await db.decrement(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(9n);
        });

        it('should initialize to -1 if key does not exist', async () => {
            const key = 'nonExistentKey';
            const response = await db.decrement(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(-1n);
        });

        it('should return error if the value at key is not an integer', async () => {
            const key = 'testKey';
            await db.set(key, 'not-a-number');
            const response = await db.decrement(key);
            expect(response.success).to.be.false;
            expect(response.error).to.include('wrongtype operation');
        });
    });

    describe('DecrementByCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete('testKey');
                await db.delete('nonExistentKey');
            } catch {
                // Ignore error if key doesn't exist
            }
        });

        it('should decrement the value of a key by specified amount', async () => {
            const key = 'testKey';
            await db.set(key, '10');
            const response = await db.decrementBy(key, 3);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(7n);
        });

        it('should initialize to negative of decrement amount if key does not exist', async () => {
            const key = 'nonExistentKey';
            const response = await db.decrementBy(key, 5);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(-5n);
        });

        it('should return error if the value at key is not an integer', async () => {
            const key = 'testKey';
            await db.set(key, 'not-a-number');
            const response = await db.decrementBy(key, 3);
            expect(response.success).to.be.false;
            expect(response.error).to.include('wrongtype operation');
        });
    });

    describe('DeleteCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete('testKey', 'key1', 'key2', 'key3');
            } catch {
                // Ignore error if keys don't exist
            }
        });

        it('should delete an existing key and return count as BigInt', async () => {
            const key = 'testKey';
            await db.set(key, 'value');
            const response = await db.delete(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(1n);
        });

        it('should return 0n when trying to delete non-existent key', async () => {
            const key = 'nonExistentKey';
            const response = await db.delete(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(0n);
        });

        it('should delete multiple keys and return count of deleted keys as BigInt', async () => {
            const keys = ['key1', 'key2', 'key3'];
            // Set multiple keys
            for (const key of keys) {
                await db.set(key, 'value');
            }

            const response = await db.delete(...keys);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(3n);
        });
    });

    describe('EchoCommand', () => {
        it('should echo back the provided message', async () => {
            const message = 'Hello DiceDB!';
            const response = await db.echo(message);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(message);
        });

        it('should echo back an empty string when no message is provided', async () => {
            const response = await db.echo();
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal('');
        });
    });

    describe('ExistsCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete('testKey', 'key1', 'key2', 'key3');
            } catch {
                // Ignore error if keys don't exist
            }
        });

        it('should return 1 if key exists', async () => {
            const key = 'testKey';
            await db.set(key, 'value');
            const response = await db.exists(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(1n);
        });

        it('should return 0 if key does not exist', async () => {
            const key = 'nonExistentKey';
            const response = await db.exists(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(0n);
        });

        it('should return count of existing keys when checking multiple keys', async () => {
            const keys = ['key1', 'key2', 'key3'];
            // Set only first two keys
            await db.set(keys[0], 'value1');
            await db.set(keys[1], 'value2');

            const response = await db.exists(...keys);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(2n);
        });
    });

    describe('ExpireCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete('testKey');
                await db.delete('expireKey');
            } catch {
                // Ignore error if keys don't exist
            }
        });

        it('should set expiry on key and return true', async () => {
            const key = 'testKey';
            await db.set(key, 'value');
            const response = await db.expire(key, 100);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(true);
        });

        it('should return false when key does not exist', async () => {
            const key = 'nonExistentKey';
            const response = await db.expire(key, 100);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(false);
        });

        it('should set expiry only when key has no expiry with NX condition', async () => {
            const key = 'expireKey';
            await db.set(key, 'value');

            // First expire should succeed
            const response1 = await db.expire(key, 100, 'NX');
            expect(response1.success).to.be.true;
            expect(response1.data.result).to.equal(true);

            // Second expire with NX should fail since key already has expiry
            const response2 = await db.expire(key, 200, 'NX');
            expect(response2.success).to.be.true;
            expect(response2.data.result).to.equal(false);
        });

        it('should set expiry only when key has existing expiry with XX condition', async () => {
            const key = 'expireKey';
            await db.set(key, 'value');

            // First expire with XX should fail since key has no expiry
            const response1 = await db.expire(key, 100, 'XX');
            expect(response1.success).to.be.true;
            expect(response1.data.result).to.equal(false);

            // Set initial expiry
            await db.expire(key, 100);

            // Second expire with XX should succeed since key has expiry
            const response2 = await db.expire(key, 200, 'XX');
            expect(response2.success).to.be.true;
            expect(response2.data.result).to.equal(true);
        });
    });

    describe('ExpireAtCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete('testKey');
                await db.delete('expireAtKey');
            } catch {
                // Ignore error if keys don't exist
            }
        });

        it('should set expiry at timestamp and return true', async () => {
            const key = 'testKey';
            await db.set(key, 'value');
            const timestamp = Math.floor(Date.now() / 1000) + 100; // 100 seconds from now
            const response = await db.expireAt(key, timestamp);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(true);
        });

        it('should return false when key does not exist', async () => {
            const key = 'nonExistentKey';
            const timestamp = Math.floor(Date.now() / 1000) + 100;
            const response = await db.expireAt(key, timestamp);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(false);
        });

        it('should set expiry only when key has no expiry with NX condition', async () => {
            const key = 'expireAtKey';
            const timestamp = Math.floor(Date.now() / 1000) + 100;
            const futureTimestamp = Math.floor(Date.now() / 1000) + 200;
            await db.set(key, 'value');

            // First expireAt should succeed
            const response1 = await db.expireAt(key, timestamp, 'NX');
            expect(response1.success).to.be.true;
            expect(response1.data.result).to.equal(true);

            // Second expireAt with NX should fail since key already has expiry
            const response2 = await db.expireAt(key, futureTimestamp, 'NX');
            expect(response2.success).to.be.true;
            expect(response2.data.result).to.equal(false);
        });

        it('should set expiry only when key has existing expiry with XX condition', async () => {
            const key = 'expireAtKey';
            const timestamp = Math.floor(Date.now() / 1000) + 100;
            const futureTimestamp = Math.floor(Date.now() / 1000) + 200;
            await db.set(key, 'value');

            // First expireAt with XX should fail since key has no expiry
            const response1 = await db.expireAt(key, timestamp, 'XX');
            expect(response1.success).to.be.true;
            expect(response1.data.result).to.equal(false);

            // Set initial expiry
            await db.expireAt(key, timestamp);

            // Second expireAt with XX should succeed since key has expiry
            const response2 = await db.expireAt(key, futureTimestamp, 'XX');
            expect(response2.success).to.be.true;
            expect(response2.data.result).to.equal(true);
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
            expect(response1.success).to.be.true;
            expect(response1.data.result).to.equal(false);

            // Later timestamp with GT should succeed
            const response2 = await db.expireAt(key, laterTimestamp, 'GT');
            expect(response2.success).to.be.true;
            expect(response2.data.result).to.equal(true);
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
            expect(response1.success).to.be.true;
            expect(response1.data.result).to.equal(false);

            // Earlier timestamp with LT should succeed
            const response2 = await db.expireAt(key, earlierTimestamp, 'LT');
            expect(response2.success).to.be.true;
            expect(response2.data.result).to.equal(true);
        });
    });

    describe('ExpireTimeCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete('testKey');
            } catch {
                // Ignore error if keys don't exist
            }
        });

        it('should return timestamp when key has expiry set', async () => {
            const key = 'testKey';
            await db.set(key, 'value');
            const expireAt = Math.floor(Date.now() / 1000) + 100;
            await db.expireAt(key, expireAt);

            const response = await db.expireTime(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(BigInt(expireAt));
        });

        it('should return -1n when key exists but has no expiry', async () => {
            const key = 'testKey';
            await db.set(key, 'value');

            const response = await db.expireTime(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(-1n);
        });

        it('should return -2n when key does not exist', async () => {
            const key = 'nonExistentKey';
            const response = await db.expireTime(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(-2n);
        });
    });

    describe('FlushDBCommand', () => {
        beforeEach(async () => {
            // Setup multiple keys to test flushing
            await db.set('key1', 'value1');
            await db.set('key2', 'value2');
            await db.hSet('hash1', { field1: 'value1' });
        });

        it('should remove all keys from the database', async () => {
            // First verify keys exist
            const exists1 = await db.exists('key1', 'key2', 'hash1');
            expect(exists1.success).to.be.true;
            expect(exists1.data.result).to.equal(3n);

            // Flush the database
            const response = await db.flushDB();
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal('OK');

            // Verify all keys are gone
            const exists2 = await db.exists('key1', 'key2', 'hash1');
            expect(exists2.success).to.be.true;
            expect(exists2.data.result).to.equal(0n);
        });

        it('should return OK even when database is empty', async () => {
            // First flush to ensure DB is empty
            await db.flushDB();

            // Try flushing again
            const response = await db.flushDB();
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal('OK');
        });
    });

    describe('GetCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete('testKey', 'nonExistentKey', 'hashKey');
            } catch {
                // Ignore error if keys don't exist
            }
        });

        it('should return the value of an existing key', async () => {
            const key = 'testKey';
            const value = 'testValue';
            await db.set(key, value);

            const response = await db.get(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(value);
        });

        it('should return empty string for a non-existent key', async () => {
            const key = 'nonExistentKey';
            const response = await db.get(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal('');
        });

        it('should handle numeric values correctly', async () => {
            const key = 'testKey';
            const value = 42;
            await db.set(key, value);

            const response = await db.get(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(String(value));
        });
    });

    describe('GetAndDeleteCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete('testKey', 'nonExistentKey');
            } catch {
                // Ignore error if keys don't exist
            }
        });

        it('should get and delete the value of an existing key', async () => {
            const key = 'testKey';
            const value = 'testValue';
            await db.set(key, value);

            const response = await db.getAndDelete(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(value);

            // Verify key was deleted
            const exists = await db.exists(key);
            expect(exists.data.result).to.equal(0n);
        });

        it('should return empty string for a non-existent key', async () => {
            const key = 'nonExistentKey';
            const response = await db.getAndDelete(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal('');
        });

        it('should retrieve and delete numeric values as strings', async () => {
            const key = 'testKey';
            const value = 42;
            await db.set(key, value);

            const response = await db.getAndDelete(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal('42');

            // Verify key was deleted
            const exists = await db.exists(key);
            expect(exists.data.result).to.equal(0n);
        });
    });

    describe('GetAndSetExpiryCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete('testKey', 'nonExistentKey');
            } catch {
                // Ignore error if keys don't exist
            }
        });

        it('should get value and set expiry in seconds', async () => {
            const key = 'testKey';
            const value = 'testValue';
            await db.set(key, value);

            const response = await db.getAndSetExpiry(key, { ex: 100 });
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(value);

            // Verify expiry was set
            const expireTime = await db.expireTime(key);
            expect(expireTime.data.result).to.be.greaterThan(0n);
        });

        it('should get value and set expiry in milliseconds', async () => {
            const key = 'testKey';
            const value = 'testValue';
            await db.set(key, value);

            const response = await db.getAndSetExpiry(key, { px: 100000 });
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(value);

            // Verify expiry was set
            const expireTime = await db.expireTime(key);
            expect(expireTime.data.result).to.be.greaterThan(0n);
        });

        it('should get value and set expiry at timestamp', async () => {
            const key = 'testKey';
            const value = 'testValue';
            await db.set(key, value);
            const futureTimestamp = Math.floor(Date.now() / 1000) + 100;

            const response = await db.getAndSetExpiry(key, {
                ex_at: futureTimestamp,
            });
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(value);

            // Verify expiry was set
            const expireTime = await db.expireTime(key);
            expect(expireTime.data.result).to.equal(BigInt(futureTimestamp));
        });

        it('should get value and remove expiry with persist option', async () => {
            const key = 'testKey';
            const value = 'testValue';
            await db.set(key, value);
            await db.expire(key, 100);

            const response = await db.getAndSetExpiry(key, { persist: true });
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(value);

            // Verify expiry was removed
            const expireTime = await db.expireTime(key);
            expect(expireTime.data.result).to.equal(-1n);
        });

        it('should return empty string for non-existent key', async () => {
            const key = 'nonExistentKey';
            const response = await db.getAndSetExpiry(key, { ex: 100 });
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal('');
        });

        it('should handle numeric values correctly', async () => {
            const key = 'testKey';
            const value = 42;
            await db.set(key, value);

            const response = await db.getAndSetExpiry(key, { ex: 100 });
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal('42');

            // Verify expiry was set
            const expireTime = await db.expireTime(key);
            expect(expireTime.data.result).to.be.greaterThan(0n);
        });
    });

    describe('GetSetCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete('testKey', 'nonExistentKey');
            } catch {
                // Ignore error if keys don't exist
            }
        });

        it('should set new value and return old value', async () => {
            const key = 'testKey';
            const oldValue = 'oldValue';
            const newValue = 'newValue';
            await db.set(key, oldValue);

            const response = await db.getSet(key, newValue);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(oldValue);

            // Verify new value was set
            const get = await db.get(key);
            expect(get.data.result).to.equal(newValue);
        });

        it('should return empty string for non-existent key', async () => {
            const key = 'nonExistentKey';
            const value = 'newValue';
            const response = await db.getSet(key, value);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal('');

            // Verify value was set
            const get = await db.get(key);
            expect(get.data.result).to.equal(value);
        });

        it('should handle numeric values correctly', async () => {
            const key = 'testKey';
            const oldValue = 42;
            const newValue = 84;
            await db.set(key, oldValue);

            const response = await db.getSet(key, newValue);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal('42');

            // Verify new value was set
            const get = await db.get(key);
            expect(get.data.result).to.equal('84');
        });
    });

    describe('GetWatchCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete('testKey', 'nonExistentKey');
            } catch {
                // Ignore error if keys don't exist
            }
        });

        it('should return a stream when watching a key', async () => {
            const key = 'testKey';
            const stream = await db.getWatch(key);

            expect(stream).to.be.instanceOf(Readable);

            return new Promise((resolve, reject) => {
                stream.once('data', (data) => {
                    expect(data.success).to.be.true;
                    expect(data.error).to.be.null;
                    expect(data.data.meta.watch).to.be.true;

                    stream.destroy();
                    resolve();
                });

                stream.once('error', reject);
            });
        });

        it('should receive updates through the stream', async () => {
            const key = 'testKey';
            const stream = await db.getWatch(key);

            return new Promise((resolve, reject) => {
                stream.on('error', reject);

                stream.on('data', (data) => {
                    expect(data.success).to.be.true;
                    expect(data.error).to.be.null;
                    expect(data.data.meta.watch).to.be.true;

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
        beforeEach(async () => {
            try {
                await db.delete('hashKey', 'stringKey');
            } catch {
                // Ignore error if keys don't exist
            }
        });

        it('should return the value of an existing hash field', async () => {
            const key = 'hashKey';
            const field = 'name';
            const value = 'testValue';
            await db.hSet(key, { [field]: value });

            const response = await db.hGet(key, field);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal(value);
        });

        it('should return empty string for a non-existent field', async () => {
            const key = 'hashKey';
            const field = 'nonexistent';
            await db.hSet(key, { otherField: 'value' });

            const response = await db.hGet(key, field);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal('');
        });

        it('should return empty string for a non-existent key', async () => {
            const key = 'nonexistentHash';
            const field = 'someField';

            const response = await db.hGet(key, field);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal('');
        });

        it('should handle numeric values correctly', async () => {
            const key = 'hashKey';
            const field = 'age';
            const value = 42;
            await db.hSet(key, { [field]: value });

            const response = await db.hGet(key, field);
            expect(response.success).to.be.true;
            expect(response.data.result).to.equal('42');
        });

        it('should return error for wrong type operation', async () => {
            const key = 'stringKey';
            const field = 'someField';
            await db.set(key, 'string value');

            const response = await db.hGet(key, field);
            expect(response.success).to.be.false;
            expect(response.error).to.include('wrongtype operation');
        });
    });

    describe('HGetAllCommand', () => {
        beforeEach(async () => {
            try {
                await db.delete('hashKey', 'stringKey');
            } catch {
                // Ignore error if keys don't exist
            }
        });

        it('should return all fields and values of a hash', async () => {
            const key = 'hashKey';
            const hash = {
                name: 'testName',
                age: '25',
                city: 'testCity',
            };
            await db.hSet(key, hash);

            const response = await db.hGetAll(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.deep.equal(hash);
        });

        it('should return empty object for non-existent key', async () => {
            const key = 'nonexistentHash';
            const response = await db.hGetAll(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.deep.equal({});
        });

        it('should handle numeric values correctly', async () => {
            const key = 'hashKey';
            await db.hSet(key, {
                int: 42,
                float: 3.14,
                string: 'text',
            });

            const response = await db.hGetAll(key);
            expect(response.success).to.be.true;
            expect(response.data.result).to.deep.equal({
                int: '42',
                float: '3.14',
                string: 'text',
            });
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

        expect(data.every((d) => d.value.success)).to.be.true;
    });

    it('should run GET.WATCH command', async () => {
        const stream = await db.getWatch('test');

        stream.on('data', (data) => {
            stream.destroy();
            expect(data.success).to.be.true;
            expect(data.error).to.be.null;
        });
    });

    it('should run HSET command', async () => {
        const data = await db.hSet('testingg', {
            name: 'Aditya',
            age: 25,
        });

        expect(data.success).to.be.true;
        expect(data.error).to.be.null;
    });

    it('should run HGET command', async () => {
        const data1 = await db.hGet('testingg', 'name');
        const data2 = await db.hGet('testingg', 'age');

        expect(data1.success).to.be.true;
        expect(data1.error).to.be.null;
        expect(data1.data.result).to.equal('Aditya');

        expect(data2.success).to.be.true;
        expect(data2.error).to.be.null;
        expect(data2.data.result).to.equal('25');
    });

    it('should run HGETALL command', async () => {
        const data = await db.hGetAll('testingg');

        expect(data.success).to.be.true;
        expect(data.error).to.be.null;
        expect(data.data.result).to.deep.equal({
            name: 'Aditya',
            age: '25',
        });
    });

    after(async () => {
        const success = await db.disconnect();
        process.exit(success ? 0 : 1);
    });
});
