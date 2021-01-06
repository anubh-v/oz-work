 import {
     ThreadManager,
     mark
 } from "./thread.js";
 const manager = new ThreadManager();
 const thread = function(...args) {
     manager.spawnThreads(...args);
 }
 manager.start(function*(threadState) {


     function* generateRandomInt(threadState, min, max) {
         return 5;
         //The maximum is exclusive and the minimum is inclusive
     }
     mark(generateRandomInt);

     const intGenerator = mark(function*(threadState) {
         return (yield* manager.suspendAndCall(threadState, generateRandomInt, 0, 10));
     })
     const zeroGenerator = mark(function*(threadState) {
         return 0;
     })

     function* generateRow(threadState, rowLength, numGenerator) {
         const row = [];
         for (let i = 0; i < rowLength; i++) {
             const num = (yield* manager.suspendAndCall(threadState, numGenerator, null));
             row.push(num);
         }
         return row;
     }
     mark(generateRow);

     function* generateMatrix(threadState, numGenerator) {
         const n = 25;
         const matrix = [];
         for (let i = 0; i < n; i++) {
             matrix.push((yield* manager.suspendAndCall(threadState, generateRow, n, numGenerator)));
         }
         return matrix;
     }
     mark(generateMatrix);

     function* dotProduct(threadState, row, matrix, colNum) {
         let result = 0;
         for (let i = 0; i < row.length; i++) {
             result += (row[i] * matrix[i][colNum]);
         }
         return result;
     }
     mark(dotProduct);

     let doneFlags = [];

     function* makeWorkForThread(threadState, rowHandledByThread) {
         const numCols = C.length;
         for (let i = 0; i < numCols; i++) {
             const temp = (yield* manager.suspendAndCall(threadState, dotProduct, A[rowHandledByThread], B, i));
             C[rowHandledByThread][i] = temp;
         }
         doneFlags[rowHandledByThread] = true;
     }
     mark(makeWorkForThread);


     const A = (yield* manager.suspendAndCall(threadState, generateMatrix, intGenerator));
     const B = (yield* manager.suspendAndCall(threadState, generateMatrix, intGenerator));
     const C = (yield* manager.suspendAndCall(threadState, generateMatrix, zeroGenerator));

     for (let i = 0; i < A.length; i++) {
         thread(mark(function*(threadState) {
             (yield* manager.suspendAndCall(threadState, makeWorkForThread, i))
         }));
     }

 });
