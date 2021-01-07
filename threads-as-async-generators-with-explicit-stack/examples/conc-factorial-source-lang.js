

function factorial(n) {
    if (n === 0) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}

thread(async () => console.log(factorial(100)),
       async () => console.log(factorial(100)));
