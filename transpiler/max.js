import { makeTransient, print, makeProcedure, waitUntilDetermined, makeNumber, deref } from './node_helpers.js';
import { gt, isTrue } from './operators.js';
import { unify } from './unify.js';
import { runner } from './conc-runner.js';

/* Oz dialect
const x;
const y;
const z;
const max;

max = function* (a, b, result) {
  const temp;
  temp = a < b;
  if (temp) {
    result = b;
  } else {
    result = a;
  }
}

x = 5;
y = 6;
max(x, y, z);
print(z);
*/

/*
const x = 5;
const y = 6;

function max(a, b) {
  if (a < b) {
    return b;
  } else {
    return a;
  }
}

print(max(x, y));

*/

function* main() {
  const x = makeTransient();
  const y = makeTransient();
  const z = makeTransient();
  const max = makeTransient();

  unify(max, makeProcedure(function* (a, b, result) {
    const temp = makeTransient();
    yield* gt(a, b, temp);

    yield* waitUntilDetermined(deref(temp));
    if (isTrue(deref(temp))) {
      unify(result, b);
    } else {
      unify(result, a);
    }
  }));

  unify(x, makeNumber(5));
  unify(y, makeNumber(6));
  waitUntilDetermined(deref(max));
  // TODO: assert if max is a procedure --> else throw exception
  yield* max.value.value(x, y, z);
  print(z);
  
}

runner(main());
