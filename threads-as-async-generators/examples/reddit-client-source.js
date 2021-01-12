import fetch from 'node-fetch';


async function download(subreddit) {
    while(true) {
      const url = `https://api.reddit.com/r/${subreddit}/count=100`;
      const rawData = await fetch(url);
      const json = await rawData.json();
      process(json);
    }
}

async function process(data) {
    const posts = data.data.children;
    for (let post of posts) {
        logPost(post);
    }
}

async function logPost(post) {
    console.log(post.data.title);
}


thread(() => download('politics'), () => download('xboxone'));