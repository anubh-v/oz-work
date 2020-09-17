function runner(entry_thread) {
    const queue = [];
    queue.unshift(entry_thread);

    while(true) {
        const current_thread = queue.shift();
        let {value, done} = current_thread.next();
        console.log(value);
        if (done) {
            if (queue.length === 0) {
                return value;
            } else {
                continue;
            }
        }

        switch(value.message) {
            case "SUSPEND":
                queue.push(current_thread);
                break;
            case "ADD_NEW_THREAD":
                const thread_to_add = value.new_thread;
                queue.push(thread_to_add);
                queue.unshift(current_thread); // allow current thread to resume
            default:
                // handle errors
        }
    }
}

exports.runner = runner;