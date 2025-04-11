/**
 * Demonstration of concurrent commmand capabilities
 */

import DiceDBClient from 'dicedb-driver';

const client = new DiceDBClient({
    host: 'localhost',
    port: 7379,
    idle_timeout_ms: 2000,
});

await client.connect();

await Promise.all([
    client.set('name', 'Aditya'),
    client.set('age', 24),
    client.set('city', 'Bengaluru'),
    client.set('state', 'Karnataka'),
    client.set('country', 'India'),
]);

const [
    {
        data: { result: name },
    },
    {
        data: { result: age },
    },
    {
        data: { result: city },
    },
    {
        data: { result: state },
    },
    {
        data: { result: country },
    },
] = await Promise.all([
    client.get('name'),
    client.get('age'),
    client.get('city'),
    client.get('state'),
    client.get('country'),
]);

console.log(name); // Aditya
console.log(age); // 24
console.log(city); // Bengaluru
console.log(state); // Karnataka
console.log(country); // India
