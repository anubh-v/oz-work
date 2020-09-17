import { makeTransient, waitUntilDetermined } from "./node_helpers.js";
import { runner } from "./conc-runner.js";


function* main() {
    const x = makeTransient();
    yield* waitUntilDetermined(x);
}

runner(main());