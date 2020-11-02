export function delay(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    });
}

const TRANSIENT = 'transient';
const REFERENCE = 'reference';
const DETERMINED = 'determined';

export class LogicVariable {
    constructor(value=undefined) {
        if (value === undefined) {
            this.value = undefined;
            this.type = TRANSIENT;
        } else {
            this.value = value;
            this.type = DETERMINED;
        }
    }

    then(onFulfilled) {
      //console.log(this);
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

    deref() {
      let temp = this;
      while(temp.type === REFERENCE) {
        temp = temp.value;
      }
      return temp;
    }

    unify(other) {
      const todo = [];
      todo.unshift([this, other]);
      const explored = [];

      while(todo.length !== 0) {
        let [a, b] = todo.shift();
        a = a.deref();
        b = b.deref();
        if (!a.equals(b)) {
          if (a.isTransient()) {
            LogicVariable.bind(a, b);
          } else if (b.isTransient()) {
            LogicVariable.bind(b, a);
          } else if (explored.indexOf(a) !== -1 && explored.indexOf(b) !== -1) {
            continue;
          } else if (Array.isArray(a.value) && Array.isArray(b.value) && (a.value.length === b.value.length)) {
            explored.unshift(a);
            explored.unshift(b);
            for (let i = 0; i < a.value.length; i++) {
              todo.unshift([a.value[i], b.value[i]]);
            }
          } else {
            explored.unshift(a);
            explored.unshift(b);
            throw new Error('Failed to unify');
          }
        }
      }
    }

    static bind(v1, v2) {
      v1.value = v2.deref();
      v1.type = REFERENCE;
    }
}
