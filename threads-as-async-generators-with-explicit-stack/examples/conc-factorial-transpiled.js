 import { ThreadManager, mark } from "../thread.js";
                        import { Message } from "../message.js";
                        const manager = new ThreadManager();
                        const thread = function(...args) {
                            manager.spawnThreads(...args);
                        }
  manager.start(async function*(threadState) {
    

async function* factorial (threadState,n)
    {
    if (n === 0) {
        return 1;
    } else {
        return n * (yield* manager.suspendAndCall(threadState, undefined, factorial, n - 1));
    }
}mark(factorial);

thread(mark(async function*(threadState) { (yield* manager.suspendAndCall(threadState, console, console.log, (yield* manager.suspendAndCall(threadState, undefined, factorial, 50)))) }));

  }); 
