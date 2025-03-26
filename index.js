import DiceDB from './src/dicedb.js';

const db = new DiceDB({
    host: 'localhost',
    port: 7379,
    conn_timout_ms: 5000,
    query_timeout_ms: 5000,
});

try {
    await db.connect();
    console.log('connected to DB');

    const data = await Promise.all([
        db.ping(),
        db.ping('Hey there!'),
        // db.handshake('watch'),
        // db.handshake('command'),
        // db.handshake(),
        db.get('Hey'),
        db.get('Welcomes'),
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
        db.flushDB(),
    ]);

    console.log(
        data,
        data.every((d) => d.success),
    );

    const conn = await db.getWatch('Hey');

    conn.on('data', (data) => {
        console.dir({ data }, { depth: null });
    });
} catch (ex) {
    console.log(ex);
}
