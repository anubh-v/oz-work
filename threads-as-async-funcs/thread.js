let count = 0;

export function thread() {
  for (let func of arguments) {
    func({count: 0});
  }
}

export function suspendNeeded(threadState) {
  threadState.count += 1;
  return threadState.count > 100;
}

export async function suspend(threadState, func) {
  await threadState.count;
  threadState.count = 0;
  return func(threadState);
}

function moreThanOneSecond(timeInterval) {
  return timeInterval[0] > 1;
}

function delay(numSeconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), numSeconds * 1000);
  });
}
