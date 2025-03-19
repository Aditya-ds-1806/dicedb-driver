const DiceDB = require("./src/dicedb");

const db = new DiceDB({
    host: 'localhost',
    port: 7379
});

(async () => {
    await db.connect();
    console.log('connected to DB');

    console.log(await db.ping());
    console.log(await db.ping('Hey there!'));

    console.log(await db.handshake('watch'));
    console.log(await db.handshake('command'));
    console.log(await db.handshake());

    console.log(await db.get('Hey'));
    console.log(await db.get('Welcomes'));

    console.log(await db.decrement('test'));
    console.log(await db.decrementBy('testing', -20));
})();
