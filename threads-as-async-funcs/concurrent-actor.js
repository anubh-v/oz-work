 import { thread, suspend, suspendNeeded } from "./thread.js";
 import { Port } from "../logic-vars-as-promise-likes/port-object.js"; 


 thread(async (threadState) => {

    const handler = new Port(message => {
        console.log(`Handled message: ${message}`);
    });

    function someWork() { }

    async function postMessage(senderId, threadState) {
        let i = 0;
        while (true) {
          suspendNeeded(threadState) ? await suspend(threadState, () => someWork()) : someWork();
          handler.send(`important message ${i} from ${senderId}`);
          i += 1;
        }
    }
     
     thread(async (threadState) => postMessage('thread A', threadState),
            async (threadState) => postMessage('thread B', threadState));
});