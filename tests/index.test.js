/* eslint-env mocha */

import { expect } from 'chai';
import { describe, before, it, after } from 'mocha';

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
        expect(data1.data.result.value).to.equal('Aditya');

        expect(data2.success).to.be.true;
        expect(data2.error).to.be.null;
        expect(data2.data.result.value).to.equal('25');
    });

    after(async () => {
        const success = await db.disconnect();
        process.exit(success ? 0 : 1);
    });
});
