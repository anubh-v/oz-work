import { LogicVariable } from "./logic-var.js";


export class Port {
    constructor(port_function) {
        this.stream = new LogicVariable();
        this.port_function = port_function;
        this.consume(this.stream, this.port_function);
    }

    async consume(stream, port_function) {
        const [head, tail] = await stream;
        port_function(await head);
        this.consume(tail, port_function);
    }

    send(message) {
        let new_tail = new LogicVariable();
        this.stream.unify(new LogicVariable([message, new_tail]));
        this.stream = new_tail;
    }
}


