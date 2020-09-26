import { LogicVariable } from "./logic-var.js";

function makeList(n, list, interval) {
    const head = n;
    const tail = new LogicVariable();

    list.unify([head, tail]);
    setTimeout(() => makeList(n + 1, tail, interval), interval);
}

async function map(input_list, map_func, output_list) {
    const [head, tail] = await input_list;
    const output_head = map_func(head);
    const output_tail = new LogicVariable();
    output_list.unify([output_head, output_tail]);
    map(tail, map_func, output_tail);
}

async function consumeList(list) {
    const [head, tail] = await list;
    console.log(head);
    consumeList(tail);
}

const integers_from_zero = new LogicVariable();
const even_integers = new LogicVariable();

// thread one - producer
(async function () { makeList(0, integers_from_zero, 1000); })();
// thread two - mapper
(async function() { map(integers_from_zero, x => x * x, even_integers); })();
// thread three - consumer
(async function() { consumeList(even_integers); })();
