import { ThreadManager } from '../thread.js';
import { Message } from '../message.js';
import { performance } from 'perf_hooks';
import { LogicVariable } from '../../logic-vars-as-promise-likes/logic-var.js';
 

function makeWorkForThread(func, ...args) {
    return async function* (threadState) {
        yield* func(threadState, ...args);
    }
}


async function* buildList(threadState, list) {
    let tail = list;

    for (let head = 2; head < 200; head++) {
        let newTail = new LogicVariable();
        tail.unify(new LogicVariable([head, newTail]));
        tail = newTail;

        yield new Message('SUSPEND');
    }

    tail.unify(new LogicVariable([])); // terminate the list
}

async function* consumeList(threadState, list) {
    let tail = list;
    let head;

    while(true) {
       // if ((yield new Message('AWAIT', tail)).length === 0) { break; }

        [head, tail] = yield new Message('AWAIT', tail);
        if (head === undefined) { break; }
         // console.log(head);
        // console.log(tail);
        
    }

    console.log(`done in ${performance.now() - startTime} ms`);
    console.log(`number of switches: ${manager.numSwitches}`);
}

async function* sieve(threadState, input_list, output_list) {

    let [head, tail] = yield new Message('AWAIT', input_list);
    if (head === undefined) {
        output_list.unify(new LogicVariable([]));
        return;
    }

    const filtered_tail = new LogicVariable();
    manager.spawnThreads(makeWorkForThread(filter, tail, elem => elem % head !== 0, filtered_tail));

    const output_head = head;
    const output_tail = new LogicVariable();
    output_list.unify(new LogicVariable([output_head, output_tail]));
    //yield* sieve(threadState, filtered_tail, output_tail);
    manager.spawnThreads(makeWorkForThread(sieve, filtered_tail, output_tail));
}

async function* filter(threadState, input_list, predicate, output_list) {    
    let head;

    while(true) {
        [head, input_list] = yield new Message('AWAIT', input_list);
        if (head === undefined) { break; }

        if (predicate(head)) {
            const output_head = head;
            const output_tail = new LogicVariable();

            output_list.unify(new LogicVariable([output_head, output_tail]));
            output_list = output_tail;
        }
    }

    output_list.unify(new LogicVariable([]));
}


const manager = new ThreadManager();
const integers = new LogicVariable();
const primes = new LogicVariable();

const startTime = performance.now();
manager.start(async function*(threadState) {
   manager.spawnThreads(makeWorkForThread(buildList, integers), 
                        makeWorkForThread(sieve, integers, primes),
                        makeWorkForThread(consumeList, primes));   
});



