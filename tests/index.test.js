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
