import { makeNumber, makeTransient, print } from './node_helpers.js';
import { unify } from './unify.js';
import { runner } from './conc-runner.js';


/* Oz core dialect
const x;
const x = 5;
print(x);
*/

/* Oz expressive dialect
const x = 5;
console.log(x);
*/

function* main() {
  const x = makeTransient();
  unify(x, makeNumber(5));
  print(x);
}

runner(main());