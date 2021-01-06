import { LogicVariable } from '../logic-vars-as-promise-likes/logic-var.js';

import { ThreadManager, mark } from "./thread.js";
                        import { Message } from "./message.js";
                        const manager = new ThreadManager();
                        const thread = function(...args) {
                            manager.spawnThreads(...args);
                        }
  manager.start(async function*(threadState) {
    
const a = new LogicVariable();
const b = new LogicVariable();

const firstThread = mark(async function*(threadState) { {
    (yield* manager.suspendAndCall(threadState, console, console.log, `Value of sum is: ${((yield new Message('AWAIT', a))) + ((yield new Message('AWAIT', b)))}`));
} })

const secondThread = mark(async function*(threadState) { {
    (yield* manager.suspendAndCall(threadState, a, a.unify, new LogicVariable(5)));
    (yield* manager.suspendAndCall(threadState, b, b.unify, new LogicVariable(10)));
} })

thread(firstThread, secondThread);
  }); 