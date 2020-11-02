import { LogicVariable } from "./logic-var.js";

/**
 * In this file, four async functions are used to generate a stream of even square numbers.
 * 
 * The stream here is "eager" because the stream producer has full control
 * over the rate at which new stream elements are generated.
 * 
 */

function makeList(n, list) {
    const head = new LogicVariable(n);
    const tail = new LogicVariable();

    list.unify(new LogicVariable([head, tail]));
    setTimeout(() => makeList(n + 1, tail), 0);
}

async function map(input_list, map_func, output_list) {
    const [head, tail] = await input_list;
    const output_head = new LogicVariable(map_func(await head));
    const output_tail = new LogicVariable();

    output_list.unify(new LogicVariable([output_head, output_tail]));
    map(tail, map_func, output_tail);
}

async function filter(input_list, predicate, output_list) {
    const [head, tail] = await input_list;
    if (predicate(await head)) {
        const output_head = head;
        const output_tail = new LogicVariable();

        output_list.unify(new LogicVariable([output_head, output_tail]));
        filter(tail, predicate, output_tail);
    } else {
        filter(tail, predicate, output_list);
    }
}

async function consumeList(list) {
    const [head, tail] = await list;
    console.log(await head);
    consumeList(tail);
}

const integers_from_zero = new LogicVariable();
const squared_integers = new LogicVariable();
const even_squares = new LogicVariable();

// thread one - producer
(async function () { makeList(0, integers_from_zero); })();
// thread two - mapper
(async function() { map(integers_from_zero, x => x * x, squared_integers); })();
// thread three - filterer
(async function() { filter(squared_integers, x => x % 2 === 0, even_squares); })();
// thread four - consumer
(async function() { consumeList(even_squares); })();

// thread five - another consumer
// (async function() { consumeList(even_squares); })();

