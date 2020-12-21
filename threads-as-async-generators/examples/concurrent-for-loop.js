import { ThreadManager } from './thread.js';

const manager = new ThreadManager();

async function* dummyWork(threadState) {
    yield 'SUSPEND';

    console.log(`starting generator in thread ${threadState.id}`);
    for (let i = 0; i < 100; i = i + 1) {
        console.log(`thread ${threadState.id}`);
        console.log(i);
        if ((i % 10) === 0) {
            console.log(i);
            yield 'SUSPEND';
        }
    }
}

manager.start(async function*(threadState) {
    manager.spawnThreads(dummyWork, dummyWork);
});


