function foo(a) {
  return 1 + bar();
}

foo();

(function () {
  console.dir('a');
})();
