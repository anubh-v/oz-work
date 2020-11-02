export function thread() {
  for (let func of arguments) {
    func({time: process.hrtime()});
  }
}

export async function suspendIfNeeded(initialTime, func) {
  const timeInterval = process.hrtime(initialTime.time);
  if (moreThanOneSecond(timeInterval)) {
    console.log('delaying');
    console.log(timeInterval[0]);
    await delay(1);
    initialTime.time = process.hrtime(); // reset timer
  }

  return func(initialTime);
}

function moreThanOneSecond(timeInterval) {
  return timeInterval[0] > 1;
}

function delay(numSeconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), numSeconds * 1000);
  });
}
