import { Port } from "../logic-vars-as-promise-likes/port-object.js"; 
import { delay } from "./logic-var.js";

const handler = new Port(message => {
    console.log(`Handled message: ${message}`);
});

(async function producer() {
    let i = 0;
    while (true) {
      handler.send(`important message ${i}`);
      i += 1;
      await delay(1);
    }
})();