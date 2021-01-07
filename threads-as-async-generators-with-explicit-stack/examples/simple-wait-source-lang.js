
function foo(n) {
    for (let i = 0; i < n; i++) {
        console.log(i);
    }
}

const firstThread = thread(async () => foo(100));

thread(async() => {
    await firstThread;
    console.log('second thread waits for first');
});
