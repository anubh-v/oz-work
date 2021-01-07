 import { ThreadManager, mark } from "./thread.js";
                        import { Message } from "./message.js";
                        const manager = new ThreadManager();
                        const thread = function(...args) {
                            manager.spawnThreads(...args);
                        }
  manager.start(async function*(threadState) {
    
async function* foo (threadState,n)
    {
    for (let i = 0; i < n; i++) {
        (yield* manager.suspendAndCall(threadState, console, console.log, i));
    }
}mark(foo);

const firstThread = thread(mark(async function*(threadState) { (yield* manager.suspendAndCall(threadState, undefined, foo, 100)) }));

thread(mark(async function*(threadState) { {
    (yield new Message('AWAIT', firstThread));
    (yield* manager.suspendAndCall(threadState, console, console.log, 'second thread waits for first'));
} }));

  }); 