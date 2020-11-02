// Possible usage
const target = new LogicVariable([new LogicVariable(5), new LogicVariable([])]);

match(target,
    async ([]) => "empty list",
    async ([X = 5, Xs]) => 20,
    async ([X, Xs]) => await X + 1),

// PROBLEM: Cannot have duplicate parameter names --> how to allow constraints on equivalent elements?

match(target,
    async ([]) => "empty list",
    async ([X = 5, Xs]) => 20,
    async ([X1 = X, X2 = X1]) => "both elements are equivalent",
    async ([X, Xs]) => await X + 1),

match(target,
    Pattern([]), async () => "empty list",
    Pattern([5, lv("Xs")]), async () => 20,
    Pattern([lv("X"), lv("Xs")]), async () => await X + 1);






function match(globalVariable, localVariable) {
    const trail = [];

    while(true) {
        try {
            unifyWithTrail(globalVariable, localVariable, trail);
        } catch(e) {
            return false;
        }

        if (trail.length == 0) {
            return true;
        }


    }


}


function unifyWithTrail(globalVariable, localVariable, trail) {
    const todo = [];
    todo.unshift([globalVariable, localVariable]);
    const explored = [];

    while(todo.length !== 0) {
        let [a, b] = todo.shift();
        a = a.deref();
        b = b.deref();

        if(!a.equals(b)) {
          if (a.isTransient()) {
              LogicVariable.bind(a, b);
          }
        }
        

    }

    

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