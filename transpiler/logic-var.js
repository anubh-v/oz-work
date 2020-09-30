export function delay(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    });
}

const TRANSIENT = 'transient';
const REFERENCE = 'reference';
const DETERMINED = 'determined';

export class LogicVariable {
    constructor(value=null) {
        if (value === null) {
            this.value = null;
            this.type = TRANSIENT;
        } else {
            this.value = value;
            this.type = DETERMINED;
        }
    }

    then(onFulfilled) {
      if (this.isTransient()) {
        setTimeout(() => this.then(onFulfilled), 0);
      } else if (this.isDetermined()) {
        onFulfilled(this.value);
      } else if (this.isReference()) {
        this.value.then(onFulfilled);
      }
    }

    isNumber() {
      return (this.type === DETERMINED) && (typeof this.value === 'number');
    }

    isTransient() {
      return this.type === TRANSIENT;
    }

    isDetermined() {
      return this.type === DETERMINED;
    }

    isReference() {
      return this.type === REFERENCE;
    }

    equals(other) {
      if (this.isNumber() && other.isNumber()) {
        return this.value === other.value;
      }
      return false;
    }

    static unify(v1, v2) {
      const todo = [];
      todo.unshift([v1,v2]);
      const explored = [];

      while(todo.length !== 0) {
        const [a, b] = todo.shift();
        if (!a.equals(b)) {
          if (a.isTransient()) {
            LogicVariable.bind(a, b);
          } else if (b.isTransient()) {
            LogicVariable.bind(b, a);
          } else if (explored.indexOf(a) !== -1 && explored.indexOf(b) !== -1) {
            continue;
          } else if (Array.isArray(a) && Array.isArray(b) && (a.length === b.length)) {
            explored.unshift(a);
            explored.unshift(b);
            for (let i = 0; i < a.length; i++) {
              todo.unshift([a[i], b[i]]);
            }
          }
        } else {
          explored.unshift(a);
          explored.unshift(b);
        }
      }
    }

    static bind(v1, v2) {
      v1.value = v2;
      v1.type = REFERENCE;
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
   LogicVariable.unify(f, new LogicVariable(5));
   LogicVariable.unify(g, new LogicVariable(10));
})();
