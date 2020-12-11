
const maxPriorities = [];
const priorities = [];

export function thread() {
  const args = [...arguments];
  for (let [func, priority] of args) {

    if (maxPriorities.length === 0 || priority > maxPriorities[0]) {
      maxPriorities.unshift(priority);
      console.log('installing max priority ' + priority);
    } else {
      maxPriorities.unshift(maxPriorities[0]);
    }

    priorities.unshift(priority);

    func({count: 0, priority: priority}).then(() =>  { 
      maxPriorities.shift()
    });
  }
}



export function suspendNeeded(threadState) {
  threadState.count += 1;
  console.log("comparing " + threadState.priority +  " vs " + maxPriorities[0]);
  return ((threadState.count > 10) || (threadState.priority < maxPriorities[0]));
}

export async function suspend(threadState, func) {
  await threadState.count;
  threadState.count = 0;
  return func(threadState);
}

export function callHandler(threadState) {
  const argsArray = [...arguments];
  const func = argsArray[1];
  const args = argsArray.slice(2);

  if (func.isInternal) {
    func(threadState, ...args);
  } else {
    func(...args);
  }

}

export function mark(func) {
  func.isInternal = true;
  return func;
}

function moreThanOneSecond(timeInterval) {
  return timeInterval[0] > 1;
}

function delay(numSeconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), numSeconds * 1000);
  });
}
