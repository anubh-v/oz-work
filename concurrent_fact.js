function fact(n) { return n === 0 ? 1 : n * fact(n - 1); }


for (let i = 0; i < 10000; i = i + 1) {
  concurrent_execute(() => display(fact(50)));
}


// 350 threads

// fact(1000000);

