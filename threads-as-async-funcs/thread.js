let nextId = 0; // id of next thread spawned
let currentTurn = 0; // id of thread that should be given control (at any point)

let threadStates = {}; // map thread id to thread state
let sleepingThreads = {}; // map thread id to thread resolver
let priorities = {}; // map thread id to thread priority
let priorityOrderings = {};


function gotoSleep(threadId) {
  return new Promise((onFulfilled) => {
    sleepingThreads[threadId] = onFulfilled;
  });
}

function wakeup(waker_func) {
  waker_func('awake');
}

export function thread() {
  const args = [...arguments];

  const threadIds = [];

  // assign threadIds
  for (let [func, priority] of args) {
    threadIds.push(nextId);
    spawn(nextId, func, priority);
    nextId += 1;
  }

  setCurrentTurn();
  console.log(threadIds);

  for (let threadId of threadIds) {
    console.log(`launching thread ${threadId}`);
    const threadFunc = threadStates[threadId].func;
    threadFunc(threadStates[threadId]).then(value => {
      deleteThread(threadId);
      setCurrentTurn();
    });
  }
    
}

function spawn(threadId, threadFunc, priority) {
  console.log(`spawning thread ${threadId} with priority ${priority}`);
  threadStates[threadId] = {id: threadId, func:threadFunc, count: 0, priority: priority};
  priorities[threadId] = priority;

  if (priorityOrderings[priority] === undefined) {
    priorityOrderings[priority] = [threadId];
  } else {
    priorityOrderings[priority].push(threadId);
  }

}

function deleteThread(threadId, threadPriority) {
  delete threadStates[threadId];
  delete priorities[threadId];
  const indexToRemove = priorityOrderings[threadPriority].indexOf(threadId);
  priorityOrderings[threadPriority].splice(indexToRemove, 1);
}

function getMaxPriority() {
  let max = 0;

  for (let priority of Object.values(priorities)) {
    max = priority > max ? priority : max;
  }

  return max;
}

function setCurrentTurn() {
  const currentMaxPriority = getMaxPriority();
  currentTurn = priorityOrderings[currentMaxPriority][0];
}

function getSleepingThreadIdByPriority(requestedPriority, threadToAvoid) {
  // return id of any sleeping thread with the given priority
    for (let [id, waker] of Object.entries(sleepingThreads)) {
      if ((priorities[id] === requestedPriority) && (threadToAvoid !== parseInt(id))) {
        return id;
      }
    }
    return undefined;
}

function numThreadsWithPriority(requestedPriority) {
    // finds number of threads that have the given priority
    let count = 0;
    for (let [id, priority] of Object.entries(priorities)) {
      if (priority === requestedPriority) {
        count += 1;
      }
    }

    return count;
}
 


export function suspendNeeded(threadState) {
  //console.log(`checking if thread ${threadState.id} should suspend`);
  threadState.count += 1;
  const currentMaxPriority = getMaxPriority();

  if (Object.keys(threadStates).length === 1) {
    // only one thread present (the current thread)
    return false;
  }

  if (threadState.priority != currentMaxPriority) {
    return true; // suspend and allow higher priority thread to continue
  }

  if (numThreadsWithPriority(threadState.priority) > 1) {
    // allow another equally important thread to run, if this thread's time slice is exhausted
    const shouldSuspend = threadState.count > 10;
    return shouldSuspend;
  }
}

export async function suspend(threadState, func) {
 // console.log(`suspending thread ${threadState.id}`);
  // identify thread to be awoken next
  const currentMaxPriority = getMaxPriority();
  const threadToWake = getSleepingThreadIdByPriority(currentMaxPriority, threadState.id);
  //console.log(`will wake ${threadToWake}`);

  // if this thread is sleeping, schedule an awakening
  if (threadToWake !== undefined) {
      const waker_func = sleepingThreads[threadToWake];
      setTimeout(() => wakeup(waker_func), 0);
  }

  await gotoSleep(threadState.id);

  // when awoken:
  threadState.count = 0;
  return func(threadState);
}

export function callHandler(threadState) {
  const argsArray = [...arguments];
  const func = argsArray[1];
  const args = argsArray.slice(2);

  if (func.isInternal) {
    return func(threadState, ...args);
  } else {
    return func(...args);
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
