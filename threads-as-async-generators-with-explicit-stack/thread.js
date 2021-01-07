import { Message } from './message.js';
import { performance } from 'perf_hooks';
 
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
        this.runnableThreads.push([threadId, [threadGenerator(threadState)], undefined]); 
    }

    spawnThreads() {
        for (let threadGenerator of arguments) {
            this.spawn(threadGenerator);
        }
    }

    async run(threadId) {
        // remove thread from sleeping threads
        const threadIndex = this.runnableThreads.findIndex(([id, stack, arg]) => id === threadId);
        let [id, stack, arg] = this.runnableThreads.splice(threadIndex, 1)[0];
        this.currentThreadId = id;
        let currentFrame = stack.pop();

        // run thread
        while(currentFrame !== undefined) {
            let result;

            if (arg != undefined) {
                result = await currentFrame.next(arg);
            } else {
                result = await currentFrame.next();
            }

            if (result.done) {
                arg = result.value;
                currentFrame = stack.pop();
                continue;
            }

            if (result.value instanceof Message) {
               if (result.value.isSuspend()) {
                   stack.push(currentFrame);
                   this.suspend(stack, id);
                   break;
               }

               if (result.value.isPromiseLike()) {
                   // indicate that current thread is blocked
                   stack.push(currentFrame);
                   this.block(stack, id);
                   Promise.resolve(result.value.value).then((arg) => {
                       this.runnableThreads.push([id, stack, arg]);
                       this.unblock(id);
                   });
                   break;
               }

               if (result.value.isCall()) {
                   stack.push(currentFrame);
                   currentFrame = result.value.value;
               }
            }

            arg = undefined;
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
        }
        
    }

    suspend(stack, threadId) {
        this.numSwitches += 1;
        this.runnableThreads.push([threadId, stack, undefined]);
    }

    // Add a thread into the list of blocked threads
    block(stack, threadId) {
        this.numSwitches += 1;
        this.blockedThreads.push([threadId, stack]);
    }

    // Remove a thread from the list of blocked threads
    unblock(threadId) {
        const indexToRemove = this.blockedThreads.findIndex(([id, stack]) => id === threadId);
        this.blockedThreads.splice(indexToRemove, 1);
    }

    /*
     Precondition: At least one runnable thread is present
     */
    selectThreadToRun(previousThread) {
        if (this.runnableThreads.length === 1) {
            return previousThread; // there is only one runnable thread, just continue it
        } else {
            return this.runnableThreads.find(([id, stack, arg]) => id !== previousThread)[0];
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
        
    }

    hasExceededRunningTime() {
        const timeNow = performance.now();
        return (timeNow - this.startTime) > 500;
    }

    shouldSuspend(threadState) {
        const timeNow = performance.now() - threadState.startTime;
        return timeNow > 20;
    }

    async *suspendAndCall(...args) {
        const threadState = args[0];
        const obj = args[1];
        const func = args[2];
        args.splice(0, 3);
        const funcArgs = args;
        if (this.shouldSuspend(threadState)) {
            yield new Message('SUSPEND');
        }

        threadState.startTime = performance.now();

        if (func.isInternal) {
            if (obj === undefined) {
                return yield new Message('CALL', func(threadState, ...funcArgs));
            } else {
                return yield new Message('CALL', func.call(obj, ...funcArgs));
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