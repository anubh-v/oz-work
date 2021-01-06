 import { ThreadManager, mark } from "../thread.js";
                        const manager = new ThreadManager();
                        const thread = function(...args) {
                            manager.spawnThreads(...args);
                        }
  manager.start(async function*(threadState) {
    

async function* foo (threadState,id)
    {
    for (let i = 0; i < 200000; i++) {
        (yield* manager.suspendAndCall(threadState, console.log, `logging ${i} from thread ${id}`));
    }
}mark(foo);

thread(mark(async function*(threadState) { {
    (yield* manager.suspendAndCall(threadState, foo, 1));
    (yield new Message('AWAIT', 1));
} })
, mark(async function*(threadState) { (yield* manager.suspendAndCall(threadState, foo, 2)) }));


  }); 