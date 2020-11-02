import { makeTransient, waitUntilDetermined } from "./node_helpers.js";
import { runner } from "./conc-runner.js";

/**
 * const x;
 * if (x) {
 *   print('true');
 * } else {
 *   print('false');
 * }
 */


function* main() {
    const x = makeTransient();
    yield* waitUntilDetermined(x);
    if (isTrue(x)) {
        print('true');
    } else {
        print('false');
    }
}

runner(main());