import { ThreadManager } from '../thread.js';
import { Message } from '../message.js';

/**
 * This sample program shows how promise-like objects can be used to block threads.
 * We launch 3 threads in this program (excluding initial thread).
 * 
 * The 1st launched thread gets blocked in every iteration of a for-loop,
 * while the other threads are never blocked.
 * 
 * Expected Behaviour: The 2nd and 3rd threads complete before the 1st,
 * but they do get interrupted when thread 1 is unblocked and runnable.
 * 
 * (i.e. thread 1 does not have to wait till thread 2 and 3 are done) 
 */

const manager = new ThreadManager();

function delay(seconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, 1000 * seconds)
    });
}

async function* slowBar(threadState) {
    for (let i = 0; i < 20; i++) {
        console.log(`thread ${threadState.id} is at iteration ${i}`);
        yield new Message('AWAIT', delay(0.2));
    }
}

async function* fastBar(threadState) {
    for (let i = 0; i < 30000; i++) {
        if ((i % 10) === 0) {
            yield new Message(`SUSPEND`);
        }

        console.log(`thread ${threadState.id} is at iteration ${i}`);
    }
}

manager.start(async function*(threadState) {
    manager.spawnThreads(slowBar, fastBar, fastBar);
});



