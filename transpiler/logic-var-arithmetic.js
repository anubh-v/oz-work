import { LogicVariable, delay } from "./logic-var.js";

const f = new LogicVariable();
const g = new LogicVariable();

// execute thread one
(async function() {
    console.log((await f) + (await g));
})();

// Thread one suspends indefinitely unless the code block below is un-commented
// execute thread two

(async function() {
   await delay(2000);
   f.unify(new LogicVariable(5));
   g.unify(new LogicVariable(10));
})();

