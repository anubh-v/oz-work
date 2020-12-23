function bar(name) {
  for (let i = 0; i < 100; i++) {
    console.log(`thread ${name} is at iteration ${i}`);
  }
}
  
thread([() => bar("one"), 1],
       [() => bar("two"), 1]);
