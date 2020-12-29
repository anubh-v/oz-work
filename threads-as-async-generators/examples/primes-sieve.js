import { performance } from 'perf_hooks';


const eratosthenes = function(n) {
    // Eratosthenes algorithm to find all primes under n
    let array = []
    let output = [];

    // Make an array from 2 to (n - 1)
    for (let i = 0; i < n; i++) {
        array.push(true);
    }

    // Remove multiples of primes starting from 2, 3, 5,...
    for (let i = 2; i < n; i++) {
        if (array[i]) {
            for (let j = i * i; j < n; j += i) {
                array[j] = false;
            }
        }
    }

    // All array[i] set to true are primes
    for (let i = 2; i < n; i++) {
        if(array[i]) {
            output.push(i);
        }
    }

    return output;
};

const startTime = performance.now();
const primes = eratosthenes(200);
console.log(primes);
console.log(`done in ${performance.now() - startTime} ms`);

