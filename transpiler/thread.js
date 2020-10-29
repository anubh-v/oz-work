export function thread() {
  for (let func of arguments) {
    func({time: process.hrtime()});
  }
}

export async function suspendIfNeeded(initialTime, isAsync, func) {
  console.log(initialTime);
  const timeInterval = process.hrtime(initialTime.time);
  if (moreThanOneSecond(timeInterval)) {
    await delay(1);
    initialTime.time = process.hrtime(); // reset timer
  }

  if (isAsync) {
    func(initialTime);
  } else {
    await func(initialTime);
  }
}

function moreThanOneSecond(timeInterval) {
  return (timeInterval[1] / 1000000) > 1;
}

function delay(numSeconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), numSeconds * 1000);
  });
}
