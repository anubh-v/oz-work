const TRANSIENT = 'transient';
const DETERMINED = 'determined';
const NUMBER = 'number';
const BOOLEAN = 'boolean';
const RECORD = 'record';
const PROCEDURE = 'procedure';
const REFERENCE = 'reference';

export function makeTransient() {
    return {node_type: TRANSIENT};
}

export function makeNumber(number) {
    return {node_type: DETERMINED, type: NUMBER, value: number};
}

export function makeBool(bool) {
    return {node_type: DETERMINED, type: BOOLEAN, value: bool};
}

export function makeRecord(label, features, record) {
    return {node_type: DETERMINED, type: RECORD, label: label, features: features, value: record};
}

export function makeProcedure(procedureGenerator) {
    return {node_type: DETERMINED, type: PROCEDURE, value: procedureGenerator};
}

function isDetermined(a) {
    return a.node_type === DETERMINED;
}

export function isNumber(a) {
    return isDetermined(a) && a.type === NUMBER;
}

function isBool(a) {
    return isDetermined(a) && a.type === BOOLEAN;
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

export function deref(a) {
    let temp = a;
    while(temp.node_type == REFERENCE) {
        temp = temp.value;
    }
    return temp;
}