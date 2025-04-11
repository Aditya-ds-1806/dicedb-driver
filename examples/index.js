/**
 * Simple GET and SET example in ESM modules
 */

import DiceDBClient from 'dicedb-driver';

const client = new DiceDBClient({
    host: 'localhost',
    port: 7379,
});

await client.connect();
await client.set('name', 'Aditya');
const response = await client.get('name');

console.log(response.data.result); // Aditya
