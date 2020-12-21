class ThreadManager {
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
        this.sleepingThreads.push([threadId, threadGenerator]); 
    }

    run(threadId) {
        // remove thread from sleeping threads
        const threadIndex = this.sleepingThreads.findIndex(([id, generator]) => id === threadId);
        const [id, generator] = this.sleepingThreads.splice(threadIndex, 1)[0];
        this.currentThreadId = id;

        // run thread
        for await (let value of generator) {
            // if thread asks to suspend
            if (value == 'SUSPEND') {
               this.sleep(generator, id);
               break;
            }
        }

        // if thread is completed / suspended, pick another sleeping thread to run (if any)
        if (this.sleepingThreads.length !== 0) {
            const nextThreadToRun = this.selectAnotherThread(id);
            this.run(nextThreadToRun);
        }
    }

    sleep(threadGenerator, threadId) {
        this.sleepingThreads.push([threadId, threadGenerator]);
    }

    selectAnotherThread(threadIdToAvoid) {
        return this.sleepingThreads.find(([id, generator]) => id !== threadIdToAvoid)[0];
    }

}