import { Message } from './message.js';
 
export class ThreadManager {
    constructor() {
        this.runnableThreads = [];
        this.blockedThreads = []; // threads waiting for promise-like objects to be resolved
        this.currentThreadId = 0;
        this.nextId = 0;
    }

    start(firstThreadGenerator) {
      this.spawn(firstThreadGenerator);
      this.startTime = performance.now();
      this.run(firstThreadGenerator);
    }

    spawn(threadGenerator) {
        const threadId = this.nextId;
        this.nextId += 1;
        this.runnableThreads.push([threadId, threadGenerator({id: threadId}), undefined]); 
    }

    spawnThreads() {
        for (let threadGenerator of arguments) {
            this.spawn(threadGenerator);
        }
    }

    async run(threadId) {
        // remove thread from sleeping threads
        const threadIndex = this.runnableThreads.findIndex(([id, generator, arg]) => id === threadId);
        const [id, generator, arg] = this.runnableThreads.splice(threadIndex, 1)[0];
        this.currentThreadId = id;

        // run thread
        let result;
        if (arg != undefined) {
            result = await generator.next();
        } else {
            result = await generator.next(arg);
        }

        while(true) {
            if (result.done) {
                break;
            }

            if (result.value instanceof Message) {
               if (result.value.isSuspend()) {
                   this.suspend(generator, id);
                   break;
               }

               if (result.value.isPromiseLike()) {
                   // indicate that current thread is blocked
                   this.block(generator, id);
                   Promise.resolve(result.value.value).then((arg) => {
                       this.runnableThreads.push([id, generator, arg]);
                   });
                   break;
               }
            }
            result = await generator.next();
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

    suspend(threadGenerator, threadId) {
        this.runnableThreads.push([threadId, threadGenerator, undefined]);
    }

    block(threadGenerator, threadId) {
        this.blockedThreads.push([threadId, threadGenerator]);
    }

    /*
     Precondition: At least one runnable thread is present
     */
    selectThreadToRun(previousThread) {
        if (this.runnableThreads.length === 1) {
            return previousThread; // there is only one runnable thread, just continue it
        } else {
            return this.runnableThreads.find(([id, generator, arg]) => id !== previousThread)[0];
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


}