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

function generateRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); 
    //The maximum is exclusive and the minimum is inclusive
  }

const intGenerator = () => generateRandomInt(0, 10);
const zeroGenerator = () => 0;
  

function generateRow(rowLength, numGenerator) {
    const row = [];
    for (let i = 0; i < rowLength; i++) {
        row.push(numGenerator());
    }
    return row;
}

function generateMatrix(numGenerator) {
    const n = 10;
    const matrix = [];
    for (let i = 0; i < n; i++) {
        matrix.push(generateRow(n, numGenerator));
    }
    return matrix;
}

function dotProduct(row, matrix, colNum) {
    let result = 0;
    for (let i = 0; i < row.length; i++) {
        result += (row[i] * matrix[i][colNum]);
    }
    return result;
}

let doneFlags = [];
function makeWorkForThread(rowHandledByThread, A, B, C) {
    return async function* (threadState) {
        const numCols = C.length;
        for (let i = 0; i < numCols; i++) {
            const temp = dotProduct(A[rowHandledByThread], B, i);
            C[rowHandledByThread][i] = temp;
            yield new Message('SUSPEND');
        }
        doneFlags[rowHandledByThread] = true;
    }
}


manager.start(async function*(threadState) {
   const A = generateMatrix(intGenerator);
   const B = generateMatrix(intGenerator);
   const C = generateMatrix(zeroGenerator);

   for (let i = 0; i < A.length; i++) {
       doneFlags[i] = false;
       manager.spawnThreads(makeWorkForThread(i, A, B, C));
   }

   manager.spawnThreads(async function*(threadState) {
       // final thread waits until multiplication is completed
       while(!doneFlags.every(v => v === true)) {
           yield new Message('SUSPEND');
       }

       console.log('done');
       console.log(C);

   })


   console.log(A);
   console.log(B);
});



