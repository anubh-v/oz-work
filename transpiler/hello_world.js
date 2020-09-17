import { makeNumber, makeTransient, print } from './node_helpers.js';
import { unify } from './unify.js';
import { runner } from './conc-runner.js';


/* Oz core dialect */
/*
const x;
const y;
const x = 5;
x = y;
print(y);
*/

/* Oz expressive dialect */
/*
const x = 5;
const y = x;
print(y);
*/

function* main() {
  const x = makeTransient();
  const y = makeTransient();
  unify(x, makeNumber(5));
  unify(y, x);
  print(y);
}

runner(main());