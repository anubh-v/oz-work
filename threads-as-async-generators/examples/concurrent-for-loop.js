import { ThreadManager } from '../thread.js';

const manager = new ThreadManager();

async function* foo(threadState) {
    console.log(`running thread ${threadState.id}`);
    yield* baz(threadState);
    manager.spawnThreads(bar);
}

async function* baz(threadState) {
    for (let i = 0; i < 100; i = i + 1) {
        console.log(`thread ${threadState.id} is at iteration ${i}`);
        if ((i % 10) === 0) {
            yield 'SUSPEND';
        }
    }
}

async function* bar(threadState) {
    console.log(`running thread ${threadState.id}`);
    return 100; // not used
}

manager.start(async function*(threadState) {
    manager.spawnThreads(foo, foo, foo, foo);

});


