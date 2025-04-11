/**
 * Demonstration of Watch/Reactivity capability
 */

import DiceDBClient from 'dicedb-driver';

const client = new DiceDBClient({
    host: 'localhost',
    port: 7379,
    idle_timeout_ms: 2000,
});

await client.connect();

const readableStream = await client.getWatch('name');

readableStream.on('data', (response) => {
    console.log(response.data.result); // Aditya, Arpit, Jyotinder
});

await client.set('name', 'Arpit');
await client.set('name', 'Jyotinder');
