import { Port  } from './port-object.js';
import { delay } from './logic-var.js';

// simulate three players passing an item to each other
const numPlayers = 3;
const players = [];

function makePlayer(playerId) {
    return new Port(async function([item, interval]) {
        console.log(`player ${playerId} got the ${item}!`);
        const otherPlayer = getRandomInt(0, numPlayers);
        await delay(interval);
        players[otherPlayer].send([item, interval]);
        console.log(`player ${playerId} passed the ${item} to player to ${otherPlayer}`);
    });
}


players[0] = makePlayer(0);
players[1] = makePlayer(1);
players[2] = makePlayer(2);

players[0].send(['ball', 1000]);
players[1].send(['bomb', 2000]);


function getRandomInt(min, max) {
    // inclusive of min, exclusive of max
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); 
}