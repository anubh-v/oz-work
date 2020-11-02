

function makeRequest() {
    return new Promise((resolve, reject) => {
        // code to make a HTTP request
        // eventually resolves with HTTP response
    });
}

const requestPromise = makeRequest();

requestPromise.then(val => {
    // use the response
})

requestPromise.then(val => {
    // use the response
})

function makeRequestByPort() {
    requestActor.send(task);
}

