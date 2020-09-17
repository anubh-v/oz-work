import { makeBool, waitUntilDetermined, deref} from "./node_helpers.js";
import { unify } from "./unify.js";

export function isTrue(a) {
    return a.value;
}

export function* gt(a, b, result) {
    yield* waitUntilDetermined(deref(a));
    yield* waitUntilDetermined(deref(b));
    unify(result, makeBool(deref(a).value < deref(b).value));
}

export function* add(a, b, result) {
    yield* waitUntilDetermined(a);
    yield* waitUntilDetermined(b);
    unify(result, makeBool(a.value + b.value));
}

export function* minus(a, b, result) {
    yield* waitUntilDetermined(a);
    yield* waitUntilDetermined(b);
    unify(result, makeBool(a.value - b.value));
}