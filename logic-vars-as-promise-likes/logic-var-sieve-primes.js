import { LogicVariable } from "./logic-var.js.js";

/**
 * In this file, async functions are used to generate prime numbers.
 * The empty array [] represents the end of a stream / list.
 */

async function sieve(input_list, output_list) {
    if ((await input_list).length === 0) {
        output_list.unify(new LogicVariable([]));
        return;
    }
    const [head, tail] = await input_list;
    const determined_head = await head;
    const filtered_tail = new LogicVariable();
    filter(tail, elem => elem % determined_head !== 0, filtered_tail);

    const output_head = head;
    const output_tail = new LogicVariable();
    output_list.unify(new LogicVariable([output_head, output_tail]));
    sieve(filtered_tail, output_tail);
}

async function filter(input_list, predicate, output_list) {
    if ((await input_list).length === 0) {
        output_list.unify(new LogicVariable([]));
        return;
    }

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

function generate_list(n, limit, list) {
    if (n < limit) {
        const head = new LogicVariable(n);
        const tail = new LogicVariable();
        list.unify(new LogicVariable([head, tail]));
        setTimeout(() => generate_list(n + 1, limit, tail), 0);
    } else {
        // empty array [] represents end of a list / stream
        list.unify(new LogicVariable([]));
    }
}

async function consumeList(list) {
    if ((await list).length === 0) {
        return;
    }
    const [head, tail] = await list;
    console.log(await head);
    consumeList(tail);
}

const integers = new LogicVariable();
const primes = new LogicVariable();

// producer thread
(async function() { generate_list(2, 1000000, integers); })();
(async function() { sieve(integers, primes); })();
(async function() { consumeList(primes); })();