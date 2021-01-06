 import { ThreadManager, mark } from "./thread.js";
                        const manager = new ThreadManager();
                        const thread = function(...args) {
                            manager.spawnThreads(...args);
                        }
  manager.start(async function*(threadState) {
    

async function* generateRandomInt (threadState,min,max)
    {
    min = (yield* manager.suspendAndCall(threadState, Math.ceil, min));
    max = (yield* manager.suspendAndCall(threadState, Math.floor, max));
    return (yield* manager.suspendAndCall(threadState, Math.floor, (yield* manager.suspendAndCall(threadState, Math.random, null)) * (max - min) + min));
    //The maximum is exclusive and the minimum is inclusive
}mark(generateRandomInt);

async function* push (threadState,arr,item)
    {
    arr[arr.length] = item;
}mark(push);

const intGenerator = mark(async function* (threadState)
    { return (yield* manager.suspendAndCall(threadState, generateRandomInt, 0,10)); })
const zeroGenerator = mark(async function* (threadState)
    { return 0; })
  
async function* generateRow (threadState,rowLength,numGenerator)
    {
    const row = [];
    for (let i = 0; i < rowLength; i++) {
        const num = (yield* manager.suspendAndCall(threadState, numGenerator, null));
        (yield* manager.suspendAndCall(threadState, push, row,num));
    }
    return row;
}mark(generateRow);

async function* generateMatrix (threadState,numGenerator)
    {
    const n = 25;
    const matrix = [];
    for (let i = 0; i < n; i++) {
        (yield* manager.suspendAndCall(threadState, push, matrix,(yield* manager.suspendAndCall(threadState, generateRow, n,numGenerator))));
    }
    return matrix;
}mark(generateMatrix);

async function* dotProduct (threadState,row,matrix,colNum)
    {
    let result = 0;
    for (let i = 0; i < row.length; i++) {
        result += (row[i] * matrix[i][colNum]);
    }
    return result;
}mark(dotProduct);

let doneFlags = [];
async function* fillRow (threadState,rowNum)
    {
    const numCols = C.length;
    for (let i = 0; i < numCols; i++) {
        const temp = (yield* manager.suspendAndCall(threadState, dotProduct, A[rowNum],B,i));
        C[rowNum][i] = temp;
    }
    doneFlags[rowNum] = true;

    (yield* manager.suspendAndCall(threadState, console.log, C));
}mark(fillRow);


const A = (yield* manager.suspendAndCall(threadState, generateMatrix, intGenerator));
const B = (yield* manager.suspendAndCall(threadState, generateMatrix, intGenerator));
const C = (yield* manager.suspendAndCall(threadState, generateMatrix, zeroGenerator));

//onsole.log(A);

for(let i = 0; i < A.length; i++) {
    thread(mark(async function*(threadState) { (yield* manager.suspendAndCall(threadState, fillRow, i)) }));
}

  }); 