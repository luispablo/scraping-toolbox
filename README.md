# scraping-tools
Common lib &amp; utils for our web scrappers

## cache

```javascript
const { buildCache } = require("scraping-toolbox");

// If path not specified, will use root directory to host the hidden .tt-collie temp directory
const cache = await buildCache("/opt/mytempdirs");

// You can clear the cache before start using it to prevent keeping old content
await cache.clear();

const isRequestCached = await cache.contains(req); // req is a Puppeteer HTTPRequest object
if (!isRequestCached) await cache.add(req);
const cachedResponse = await cache.get(req);
// And then you can respond with this cached item
req.respond(cachedResponse);
```

## pptr

```javascript
const { pptr } = require("scraping-toolbox");

const [anchor] = await page.$x("//a");
const href = await prop(anchor, "href");
```

## wait

```javascript
const { wait } = require("scraping-toolbox");

// Wait 80ms, plus a random number between 0 and 20 additional milliseconds
await wait(80, 20); 
```
