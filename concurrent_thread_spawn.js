
const NUM_THREADS = 10;

for (let i = 0; i < NUM_THREADS; i = i + 1) {
  concurrent_execute(() => display(i));
}

// up to 10K threads possible
