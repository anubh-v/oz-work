export class Message {
    constructor(code, value) {
        this.code = code; // the code specifies the kind of message
        this.value = value; // optional
    }

    isPromiseLike() {
        return this.code === 'AWAIT';
    }

    isSuspend() {
        return this.code === 'SUSPEND';
    }

    isCall() {
        return this.code === 'CALL';
    }
}