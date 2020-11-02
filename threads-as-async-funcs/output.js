 import {
     thread,
     suspendIfNeeded
 } from "./thread.js";
 thread(async (initialTime) => {
     thread(async (initialTime) => goo(initialTime, 0), 
            async (initialTime) => goo(initialTime, 1));

     async function goo(initialTime, id) {
         for (let i = 0; i < 800000; i++) {
             console.log(initialTime, i, "thread " + id)
             await (() => 1)();
         }
     }


     // thread(() => goo(2));
 });