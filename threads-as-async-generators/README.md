
This directory contains an implementation of
threads.

Each thread is represented by a JavaScript generator function. The generator should yield control periodically, to facilitate co-operative thread scheduling.

The generator can also request to be blocked on a promise-like object (see section on thread blocking).

## Thread creation

To create threads, we first instantiate a `ThreadManager`.
Then, its `start` method is calling with an generator function. This function represents the first thread.

Within the first thread, we can call the manager's `spawn` method with a list of X generators functions.
This represents adding X threads to the thread pool.

Each thread's generator function should accept an argument `threadState`. This contains the thread ID and other info used by the thread scheduler.

## Context switching

At any point, there will be X generator functions that have been created as shown above.

Behind the scenes, each generator function is assigned an ID number.

The `ThreadManager`  determines which generator should be allowed to run at any time.

## Suspension points
Threads suspend by yielding control to the `ThreadManager` (using `yield new Message('SUSPEND')`)

The `ThreadManager` then places the suspended thread's generator into a queue that represents `runnable threads`.

Finally, the next runnable thread's generator is retrieved and allowed to resume.

## Thread Blocking

It is possible that a thread needs to be blocked until some value is available (e.g. an HTTP response). If this value is represented by a promise-like object, threads can request to be blocked by yielding and passing the promise-like to the `ThreadManager`.

The `ThreadManager` will then consider the thread generator as `blocked` and not `runnable`.
It will attach a callback function to the promise-like object, which will mark the generator as `runnable` once the promise is resolved.

## Examples
The `examples` folder contains some sample programs that use the `ThreadManager`.
They can be run using node or via the browser (via the corresponding HTML file).