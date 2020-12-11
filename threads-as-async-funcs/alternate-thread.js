 import {
     thread,
     suspend,
     suspendNeeded
 } from "./thread.js";


 thread(async (threadState) => {
     thread(async (threadState) => goo(0, threadState), 
            async (threadState) => goo(1, threadState),
            async (threadState) => goo(2, threadState),
            async (threadState) => goo(3, threadState));

     thread(async (threadState) => goo(4, threadState));
                 
     console.log('hi');

     async function goo(id, threadState) {
                      for (let i = 0; i < 8000000000; i++) {
                          suspendNeeded(threadState) ? await suspend(threadState, () => console.log('thread ' + id)) 
                                : console.log('thread ' + id);
                      }
                    }
                });