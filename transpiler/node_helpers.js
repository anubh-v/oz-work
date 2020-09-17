const TRANSIENT = 'transient';
const DETERMINED = 'determined';
const NUMBER = 'number';
const RECORD = 'record';

export function makeTransient() {
    return {node_type: TRANSIENT};
}

export function makeNumber(number) {
    return {node_type: DETERMINED, type: NUMBER, value: number};
}

export function makeRecord(label, features, record) {
    return {node_type: DETERMINED, type: RECORD, label: label, features: features, value: record};
}

function isDetermined(a) {
    return a.node_type === DETERMINED;
}

export function isNumber(a) {
    return isDetermined(a) && a.type === NUMBER;
}

export function isTransient(a) {
    return a.node_type === TRANSIENT;
}

export function isRecord(a) {
    return isDetermined(a) && a.type === RECORD;
}

export function arityMatch(a, b) {
    if (a.label !== b.label) {
        return false;
    }

    if (a.features.length !== b.features.length) {
        return false;
    }

    for (let i = 0; i < a.features.length; i++) {
        if (a.features[i] !== b.features[i]) {
            return false;
        }
    }

    return true;
}

export function print(a) {
    console.log(a);
}

export function* waitUntilDetermined(a) {
    while(!isDetermined(a)) {
        yield { message: 'SUSPEND'};
    }
    return true;
}