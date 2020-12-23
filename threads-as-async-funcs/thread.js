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

  for (let threadId of threadIds) {
    console.log(`launching thread ${threadId}`);
    const threadFunc = threadStates[threadId].func;
    threadFunc(threadStates[threadId]).then(value => {
      deleteThread(threadId, priorities[threadId]);
      setCurrentTurn();
      scheduleWake(currentTurn);
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
  console.log(`deleting thread ${threadId}`);
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

  if (Object.entries(threadStates).length === 0) {
    return;
  }

  const currentMaxPriority = getMaxPriority();
  currentTurn = priorityOrderings[currentMaxPriority][0];
}

export function suspendNeeded(threadState) {
  console.log(`checking if thread ${threadState.id} should suspend`);
  threadState.count += 1;
  if (threadState.id !== currentTurn) {
    return true;
  }

  if (priorityOrderings[threadState.priority].length === 1) {
    return false; // current thread has highest priority
  }

  const shouldSuspend = threadState.count > 10;
  if (shouldSuspend) {
    const indexToRemove = priorityOrderings[threadState.priority].indexOf(threadState.id);
    priorityOrderings[threadState.priority].splice(indexToRemove, 1);
    priorityOrderings[threadState.priority].push(threadState.id);
  }
  return shouldSuspend;
}

export async function suspend(threadState, func) {
 console.log(`suspending thread ${threadState.id}`);
  // identify thread to be awoken next
  setCurrentTurn();
  scheduleWake(currentTurn);

  await gotoSleep(threadState.id);

  // when awoken:
  threadState.count = 0;
  return func(threadState);
}

function scheduleWake(threadToWake) {
  //console.log(`will wake ${threadToWake}`);
  // if this thread is sleeping, schedule an awakening
  if (threadToWake in sleepingThreads) {
    const waker_func = sleepingThreads[threadToWake];
    setTimeout(() => wakeup(waker_func), 0);
  }
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
