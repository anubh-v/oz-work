import { ThreadManager } from '../thread.js';
import { Message } from '../message.js';
import { performance } from 'perf_hooks';
import { LogicVariable } from '../../logic-vars-as-promise-likes/logic-var.js';
 

function isEmptyList(list) { return list.isArray && list.length === 0 };

async function* buildList(threadState) {
    let tail = integers;

    for (let head = 0; head < 100; head++) {
        let newTail = new LogicVariable();
        tail.unify(new LogicVariable([head, newTail]));
        tail = newTail;

        yield new Message('SUSPEND');
    }

    tail.unify(new LogicVariable([])); // terminate the list
}

async function* consumeList(threadState) {
    let tail = integers;
    let head;

    while(true) {
        [head, tail] = yield new Message('AWAIT', tail);
        // console.log(head);
        // console.log(tail);
        if (head === undefined) { break; }
    }

    console.log(`done in ${performance.now() - startTime} ms`);
}


const manager = new ThreadManager();
const integers = new LogicVariable();

const startTime = performance.now();
manager.start(async function*(threadState) {
   manager.spawnThreads(buildList);
   manager.spawnThreads(consumeList);
   
});



