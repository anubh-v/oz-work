thread(() => goo(0),
       () => goo(1));
function goo(id) {
  for (let i = 0; i < 8000000000; i++) {
    console.log("thread " + id);
  }
}
