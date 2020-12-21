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
      this.run(firstThreadGenerator);
    }

    spawn(threadGenerator) {
        const threadId = this.nextId;
        this.nextId += 1;
        this.runnableThreads.push([threadId, false, threadGenerator({id: threadId})]); 
    }

    spawnThreads() {
        for (let threadGenerator of arguments) {
            this.spawn(threadGenerator);
        }
    }

    async run(threadId) {
        // remove thread from sleeping threads
        const threadIndex = this.runnableThreads.findIndex(([id, hasRun, generator]) => id === threadId);
        const [id, hasRun, generator] = this.runnableThreads.splice(threadIndex, 1)[0];
        this.currentThreadId = id;

        // run thread
        let result = await generator.next();

        while(true) {
            if (result.done) {
                break;
            }

            if (result.value instanceof Message) {
               if (result.value.isSuspend()) {
                   this.sleep(generator, id);
                   break;
               }

               if (result.value.isPromise()) {
                   Promise.resolve(result.value.value).then()
                   break;
               }
            }
            result = await generator.next();
        }


        // if thread is completed / suspended, pick another sleeping thread to run (if any)
        if (this.runnableThreads.length !== 0) {
            const nextThreadToRun = this.selectAnotherThread(id);
            this.run(nextThreadToRun);
        }
    }

    sleep(threadGenerator, threadId) {
        this.runnableThreads.push([threadId, true, threadGenerator]);
    }

    selectAnotherThread(threadIdToAvoid) {
        return this.runnableThreads.find(([id, hasRun, generator]) => id !== threadIdToAvoid)[0];
    }

}