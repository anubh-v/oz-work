function fact(n) { return n === 0 ? 1 : n * fact(n - 1); }


for (let i = 0; i < 350; i = i + 1) {
  concurrent_execute(() => display(fact(8000)));
}


// 350 threads

// fact(1000000);

