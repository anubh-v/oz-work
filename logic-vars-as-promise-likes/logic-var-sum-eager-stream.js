import { LogicVariable } from "./logic-var.js";

/**
 * In this file, async functions are used to sum an eager stream of consecutive integers.
 * The empty array [] represents the end of a stream
 */

async function sum(list, sum_so_far) { 
  if ((await list).length === 0) {
      return sum_so_far;
  }

  const [head, tail] = await list;
  return sum(tail, sum_so_far + await head);
}

function generate_list(n, limit, list) {
    if (n < limit) {
        const head = new LogicVariable(n);
        const tail = new LogicVariable();
        list.unify(new LogicVariable([head, tail]));
        generate_list(n + 1, limit, tail);
    } else {
        // empty array [] represents end of a list / stream
        list.unify(new LogicVariable([]));
    }
}

const xs = new LogicVariable();

// producer thread
(async function() { generate_list(0, 100, xs); })();
// consumer thread
(async function() { console.log(await sum(xs, 0)); })();
// consumer thread
(async function() { console.log(await sum(xs, 0)); })();
// consumer thread
(async function() { console.log(await sum(xs, 0)); })();