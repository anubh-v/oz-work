
/** List is a pair whose tail is a promise of a list */
function makeList(n) {
    const head = n;

    const tail = new Promise((resolve, rej) => {
      // Produces the tail after 2 seconds
      setTimeout(() => {
        resolve(makeList(n + 1));
      },
      500);
    });

    return Promise.resolve([head, tail]);
}

const f = makeList(0);

async function consumeList(list) {
  const [head, tail] = await list;
  console.log(head);
  consumeList(tail);
}

consumeList(f);

// Un-comment the statement below to see that the same stream can be consumed by several readers concurrently
//consumeList(f);
