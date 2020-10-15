import { LogicVariable, delay } from "./logic-var.js";


class Port {
    constructor(port_function) {
        this.stream = new LogicVariable();
        this.port_function = port_function;
        this.consume(this.stream, this.port_function);
    }

    async consume(stream, port_function) {
        const [head, tail] = await stream;
        port_function(await head);
        this.consume(tail, port_function);
    }

    send(message) {
        let new_tail = new LogicVariable();
        this.stream.unify(new LogicVariable([message, new_tail]));
        this.stream = new_tail;
    }
}


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