const runner = require('./conc-runner');

function* main_thread() {
    // intialise shared memory
    const data = {};
    data['matrix'] = init_matrix();
    data['work_done'] = [false, false];

    yield {message: 'ADD_NEW_THREAD', new_thread: worker_thread(0, data)};
    yield {message: 'ADD_NEW_THREAD', new_thread: worker_thread(1, data)};
    while (data['work_done'].some(is_work_done => !is_work_done)) {
        console.log('suspending main thread');
        yield {message:'SUSPEND'};
    }

    return data.matrix;
}

function* worker_thread(thread_id, data) {
    const matrix = data['matrix'];
    for (let i = thread_id; i < matrix.length; i = i + 2) {
        console.log('working on row ' + i);
        const row = matrix[i];
        matrix[i] = increment_row(row);
        console.log('suspending row ' + i);
        yield {message:'SUSPEND'};
    }
    data['work_done'][thread_id] = true; // indicate that worker is done
    console.log('worker ' + thread_id + ' done');

}

runner.runner(main_thread());

function increment_row(row) {
    return row.map(element => element + 1);
}

function init_matrix() {
    return [[0,0], [0,0], [0,0], [0,0]];
}
