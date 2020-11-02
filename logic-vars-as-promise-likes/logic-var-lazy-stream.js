import { LogicVariable } from "./logic-var.js";


/**
 * In this file, four async functions are used to generate a stream of consecutive numbers.
 * 
 * The stream here is "lazy" because the stream consumer has full control
 * over the rate at which new stream elements are generated.
 * 
 */

async function makeList(n, list) {
    // List producer waits until a new pair is demanded by the consumer
    const [head, tail] = await list;
    head.unify(new LogicVariable(n));
    makeList(n + 1, tail);
}

async function consumeList(list, consumer_id, interval) {
    console.log(`I am the ${consumer_id} consumer!`);
    const head = new LogicVariable();
    const tail = new LogicVariable();
    // List consumer signals that it is ready to consume by binding the list to a new pair of logic vars 
    list.unify(new LogicVariable([head, tail]));
    // List consumer waits till the producer has provided the head of this new pair
    console.log(await head);
    setTimeout(() => consumeList(tail, consumer_id, interval), interval);
}

const list = new LogicVariable();

// thread one - producer
(async function() { makeList(0, list); })();
// thread two - a consumer that demands one element per hundredth of a second
(async function() { consumeList(list, "fast", 10); })();
// thread two - a consumer that demands one element per second
(async function() { consumeList(list, 'SLOW', 1000); })();