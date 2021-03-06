import { Message } from './message.js';
import { performance } from 'perf_hooks';

class Thread {
    constructor(id, threadGenerator, continuationArg, resolver) {
         this.id = id;
         this.threadGenerator = threadGenerator;
         this.continuationArg = continuationArg;
         this.resolver = resolver;
    }

    async runTillNextYield() {
        let yieldResult;
        if (this.continuationArg != undefined) {
            yieldResult = await this.threadGenerator.next(this.continuationArg);
        } else {
            yieldResult = await this.threadGenerator.next();
        }
        return yieldResult;
    }

}
 
export class ThreadManager {
    constructor() {
        this.runnableThreads = [];
        this.blockedThreads = []; // threads waiting for promise-like objects to be resolved
        this.currentThreadId = 0;
        this.nextId = 0;
        this.numSwitches = 0; // track number of thread switches, for debugging purposes
    }

    start(firstThreadGenerator) {
      this.spawn(firstThreadGenerator);
      this.startTime = performance.now();
      this.run(firstThreadGenerator);
    }

    spawn(threadGenerator) {
        const threadId = this.nextId;
        this.nextId += 1;
        const threadState = {id: threadId, startTime: performance.now()};
        let resolver;
        const threadPromise = new Promise(onFulfilled => {
            resolver = onFulfilled;
        });
        this.runnableThreads.push(new Thread(threadId, threadGenerator(threadState), undefined, resolver));
        return threadPromise;
    }

    spawnThreads() {
        const threadPromises = [];
        for (let threadGenerator of arguments) {
            threadPromises.push(this.spawn(threadGenerator));
        }
        return threadPromises;
    }

    getRunnableThread(threadId) {
        const threadIndex = this.runnableThreads.findIndex(thread => thread.id === threadId);
        const thread = this.runnableThreads.splice(threadIndex, 1)[0];
        return thread;
    }

    makeRunnable(thread) {
        this.runnableThreads.push(thread);
    }

    async run(threadId) {
        // remove thread from runnable threads
        const thread = this.getRunnableThread(threadId);
        this.currentThreadId = thread.id;

        while(true) {
            const currentTime = performance.now();
            let result = await thread.runTillNextYield();
            if (this.threadTime) {
                this.threadTime += (performance.now() - currentTime);
            } else {
                this.threadTime = (performance.now() - currentTime);
            }

            if (result.done) {
                break;
            }

            if (result.value instanceof Message) {
               if (result.value.isSuspend()) {
                   this.suspend(thread);
                   break;
               }

               if (result.value.isPromiseLike()) {
                   // indicate that current thread is blocked
                   this.block(thread);
                   Promise.resolve(result.value.value).then((arg) => {
                       thread.continuationArg = arg;
                       this.makeRunnable(thread);
                       this.unblock(thread.id);
                   });
                   break;
               }
            }
        }

        // TODO: schedule a timeout if needed
        if (this.hasExceededRunningTime()) {
            console.log('timing out');
            setTimeout(() => {
                this.startTime = performance.now();
                this.poll();
            }, 0);
            return;
        }

        // if thread is completed / suspended / blocked, pick another runnable thread to run (if any)
        if (this.runnableThreads.length !== 0) {
            const nextThreadToRun = this.selectThreadToRun(this.currentThreadId);
            this.run(nextThreadToRun);
            return;
        }

        if (this.blockedThreads.length !== 0) {
            // no more runnable threads, but there are blocked threads
            // schedule a poll after some time
            setTimeout(() => this.poll(), 0);
            return;
        }

        this.done();
        
    }

    suspend(thread) {
        thread.continuationArg = undefined;
        this.numSwitches += 1;
        this.makeRunnable(thread);
    }

    // Add a thread into the list of blocked threads
    block(thread) {
        this.numSwitches += 1;
        this.blockedThreads.push(thread);
    }

    // Remove a thread from the list of blocked threads
    unblock(threadId) {
        const indexToRemove = this.blockedThreads.findIndex((thread) => thread.id === threadId);
        this.blockedThreads.splice(indexToRemove, 1);
    }

    /*
     Precondition: At least one runnable thread is present
     */
    selectThreadToRun(previousThread) {
        if (this.runnableThreads.length === 1) {
            return previousThread; // there is only one runnable thread, just continue it
        } else {
            return this.runnableThreads.find((thread) => thread.id !== previousThread);
        }
    }

    poll() {
        // check if there are any runnable threads
        // if yes, run one of them
        if (this.runnableThreads.length !== 0) {
            const nextThreadToRun = this.runnableThreads[0][0];
            this.run(nextThreadToRun);
            return;
        }

        // if no runnable threads, check if there are blocked threads
        if (this.blockedThreads.length !== 0) {
            // schedule another poll after some time
            setTimeout(() => this.poll(), 0);
            return;
        }

        // if no runnable, and no blocked threads, no further work needed by ThreadManager
        this.done();
    }

    hasExceededRunningTime() {
        const timeNow = performance.now();
        return (timeNow - this.startTime) > 500;
    }

    shouldSuspend(threadState) {
        const timeNow = performance.now() - threadState.startTime;
        return timeNow > 20;
    }

    done() {
        console.log(this.threadTime);
    }

    *suspendAndCall(...args) {
        const threadState = args[0];
        const obj = args[1];
        const func = args[2];
        args.splice(0, 3);
        const funcArgs = args;
        if (this.shouldSuspend(threadState)) {
            yield new Message('SUSPEND');
            threadState.startTime = performance.now();
        }

       // console.log(args);
        if (func.isInternal) {
            if (obj === undefined) {
                return yield* func(threadState, ...funcArgs);
            } else {
                return yield* func.call(obj, ...funcArgs);
            }
        } else {
            if (obj === undefined) {
               return func(...funcArgs);
            } else {
                return func.call(obj, ...funcArgs);
            }
        }
    }


}

export function mark(func) {
    func.isInternal = true;
    return func;
}