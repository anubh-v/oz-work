//import fetch from 'node-fetch';
import { ThreadManager, mark } from "../thread.js";
                        import { Message } from "../message.js";
                        const manager = new ThreadManager();
                        export const thread = function(...args) {
                            manager.spawnThreads(...args);
                        }
  manager.start(async function*(threadState) {


async function* download (threadState,subreddit)
    {
    while(true) {
      const url = `https://api.reddit.com/r/${subreddit}/`;
      const rawData = (yield new Message('AWAIT', (yield* manager.suspendAndCall(threadState, undefined, fetch, url))));
      const json = (yield new Message('AWAIT', (yield* manager.suspendAndCall(threadState, rawData, rawData.json))));
      (yield* manager.suspendAndCall(threadState, undefined, process, json));
    }
}mark(download);

async function* process (threadState,data)
    {
    const posts = data.data.children;
    for (let post of posts) {
        (yield* manager.suspendAndCall(threadState, undefined, logPost, post));
    }
}mark(process);

async function* logPost (threadState,post)
    {
    (yield* manager.suspendAndCall(threadState, console, console.log, post.data.title));
}mark(logPost);


thread(mark(async function*(threadState) { (yield* manager.suspendAndCall(threadState, undefined, download, 'politics')) }), mark(async function*(threadState) { (yield* manager.suspendAndCall(threadState, undefined, download, 'xboxone')) }));
  }); 