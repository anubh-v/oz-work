function goo(id) {
  for (let i = 0; i < 8000000000; i++) {
    console.log("thread " + id);
  }
}

(function(id) { console.log(id + 5); })(5);

thread(() => goo(0),
       () => goo(1));
