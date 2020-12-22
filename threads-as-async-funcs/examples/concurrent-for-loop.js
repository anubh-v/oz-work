import { suspend, thread } from "../thread.js";

async function bar(threadState, name) {
    for (let i = 0; i < 8000000000; i++) {

      console.log("thread " + name);
      if ((i % 10) === 0) {
          await suspend(threadState, () => 1);
      }

    }
  }
    
  thread([async (threadState) => bar(threadState, "one"), 1],
         [async (threadState) => bar(threadState, "two"), 1]);
  