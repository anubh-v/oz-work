import { ThreadManager } from '../thread.js';
import { Message } from '../message.js';

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
    for (let i = 0; i < 1000000; i++) {
        if ((i % 10) === 0) {
            yield new Message(`SUSPEND`);
        }

        console.log(`thread ${threadState.id} is at iteration ${i}`);
    }
}

manager.start(async function*(threadState) {
    manager.spawnThreads(slowBar, fastBar, fastBar);
});



