
const a = new LogicVariable();
const b = new LogicVariable();

const firstThread = async () => {
    console.log(`Value of sum is: ${(await a) + (await b)}`);
}

const secondThread = async () => {
    a.unify(new LogicVariable(5));
    b.unify(new LogicVariable(10));
}

thread(firstThread, secondThread);