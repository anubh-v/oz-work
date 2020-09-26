import { LogicVariable } from "./logic-var.js";

async function makeList(n, list) {
    // List producer waits until a new pair is demanded by the consumer
    const [head, tail] = await list;
    head.unify(n);
    makeList(n + 1, tail);
}

async function consumeList(list) {
    const [head, tail] = [new LogicVariable(), new LogicVariable()];
    // List consumer signals that it is ready to consume by binding the list to a new pair of logic vars 
    list.unify([head, tail]);
    // List consumer waits till the producer has provided the head of this new pair
    console.log(await head);
    setTimeout(() => consumeList(tail), 1000);
}

const list = new LogicVariable();

// thread one - producer
(async function() { makeList(0, list); })();
// thread two - consumer
(async function() { consumeList(list); })();