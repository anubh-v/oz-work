import { isNumber, isRecord, arityMatch } from "./node_helpers.js";
import { isTransient } from "./node_helpers.js";
 

export function unify(n1,n2) {
    const todo = [];
    todo.unshift([n1,n2]);
    const explored = [];
    
    while(todo.length !== 0) {
        const [a, b] = todo.shift();

        if (!areNodesEqual(a,b)) {
          if (isTransient(a)) {
              bind(a, b);
          } else if (isTransient(b)) {
              bind(b, a);
          } else if (explored.indexOf(a) !== -1 && explored.indexOf(b) !== -1) {
              continue;
          } else if (isRecord(a) && isRecord(b)
                     && arityMatch(a, b)) {

              explored.unshift(a);
              explored.unshift(b);
              for (const feature of a.features) {
                  todo.unshift([a.value[feature],   b.value[feature]]);
              }
          }
        } else {
          explored.unshift(a);
          explored.unshift(b);
          break;
        }
    }

}

/**
 * Binds a transient node to a specified node
 */
function bind(transient, b) {
    transient.node_type = 'reference';
    transient.value = b;
}

function areNodesEqual(a, b) {
    if (isNumber(a) && isNumber(b)) {
        return a.value === b.value;
    }
    return false;
}