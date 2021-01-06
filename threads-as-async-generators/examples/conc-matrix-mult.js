import { ThreadManager } from '../thread.js';
import { Message } from '../message.js';
import { performance } from 'perf_hooks';


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
    const n = 400;
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
   const startTime = performance.now();
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

       console.log(`done in ${performance.now() - startTime} ms`);
       console.log(`number of thread switches: ${manager.numSwitches}`);
       //console.log(C);

   })


   // console.log(A);
   //console.log(B);
});



