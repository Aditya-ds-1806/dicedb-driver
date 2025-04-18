/* eslint-env mocha */

import { expect } from 'chai';
import { describe, before, it, after, beforeEach } from 'mocha';

import DiceDB from '../dist/index.js';

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

    after(async () => {
        const success = await db.disconnect();
        process.exit(success ? 0 : 1);
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
});
