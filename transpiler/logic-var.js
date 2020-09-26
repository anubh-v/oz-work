export function delay(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    });
}

export class LogicVariable {
    constructor() {
        this.value = null;
        this.isDetermined = false;
    }

    unify(value) {
        this.isDetermined = true;
        this.value = value;
    }

    then(onFulfilled) {
      if (!this.isDetermined) {
        setTimeout(() => this.then(onFulfilled), 0);
      } else {
        onFulfilled(this.value);
      }
    }
}

const f = new LogicVariable();
const g = new LogicVariable();

// execute thread one
(async function() {
    console.log((await f) + (await g));
})();

// execute thread two
(async function() {
    await delay(2000);
    f.unify(5);
    g.unify(10);
})();
