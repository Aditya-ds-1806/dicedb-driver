/**
 * Simple GET and SET example in CJS modules
 */

const DiceDBClient = require('dicedb-driver').default;

(async () => {
    const client = new DiceDBClient({
        host: 'localhost',
        port: 7379,
    });

    await client.connect();
    await client.set('name', 'Aditya');
    const response = await client.get('name');

    console.log(response.data.result); // Aditya
})();
