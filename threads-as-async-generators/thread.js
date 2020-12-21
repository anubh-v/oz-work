export class ThreadManager {
    constructor() {
        this.sleepingThreads = [];
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
        this.sleepingThreads.push([threadId, false, threadGenerator({id: threadId})]); 
    }

    spawnThreads() {
        for (let threadGenerator of arguments) {
            this.spawn(threadGenerator);
        }
    }

    async run(threadId) {
        // remove thread from sleeping threads
        const threadIndex = this.sleepingThreads.findIndex(([id, hasRun, generator]) => id === threadId);
        const [id, hasRun, generator] = this.sleepingThreads.splice(threadIndex, 1)[0];
        this.currentThreadId = id;

        // run thread
        let result = await generator.next();

        while(true) {
            if (result.done) {
                break;
            }

            if (result.value == 'SUSPEND') {
               this.sleep(generator, id);
               break;
            }
            result = await generator.next();
        }


        // if thread is completed / suspended, pick another sleeping thread to run (if any)
        if (this.sleepingThreads.length !== 0) {
            const nextThreadToRun = this.selectAnotherThread(id);
            this.run(nextThreadToRun);
        }
    }

    sleep(threadGenerator, threadId) {
        this.sleepingThreads.push([threadId, true, threadGenerator]);
    }

    selectAnotherThread(threadIdToAvoid) {
        return this.sleepingThreads.find(([id, hasRun, generator]) => id !== threadIdToAvoid)[0];
    }

}