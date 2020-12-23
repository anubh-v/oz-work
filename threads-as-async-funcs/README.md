

This directory contains an implementation of
threads.

Each thread is represented by an asynchronous JavaScript function. The asynchronous function should have suspension points in its body, to facilitate co-operative scheduling.

## Thread creation

To create threads, the `thread` function is called with a list of `async` functions. Each `async` function should be given a integer-valued priority.

The snippet below creates 2 threads.

```
thread([async (threadState) => { // body }, 1],
        [async (threadState)] => { // body }, 2]);
```

Each thread's async function accepts an argument `threadState`. This contains the thread's ID, its priority and other information used for the book-keeping logic.

## Context switching

At any point, there will be X asynchronous functions that have been created as shown above.

Behind the scenes, each async function is assigned an ID number.

There is book-keeping logic (in `thread.js`) that determines (based on priority levels) which asynchronous function should be allowed to run at any time. This async function is said to have the "current turn".

The book-keeping logic will assign the "current turn" to the thread with the highest priority. If there are multiple such threads, each thread gets the "turn" in a round-robin manner.

Async functions that do not have the "current turn" will be forced to suspend when their evaluation hits a suspension point.

The "current turn" is re-determined under 3 situations:

- When new threads are created
- When a thread completes execution
- When there are multiple threads with the highest priority level and one of them exceeds its "time slice"

## Suspension points
Threads suspend by awaiting on Promises that will never resolve directly.

The Promise's resolver function is stored in an object (indexed by the thread's ID).

When the thread needs to be resumed, its resolver function will be retrieved and called.

## Transpiler
A simple transpiler has been created. It converts thread functions into asynchronous functions and adds suspension points into the function bodies.

A suspension can occur at any function application.