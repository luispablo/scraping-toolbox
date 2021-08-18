# scraping-tools
Common lib &amp; utils for our web scrappers

## cache

```javascript
const { buildCache } = require("scraping-toolbox");

const exceptions = ["very-important1.js", "very-important2.js"];
const cache = await buildCache({ path: "/opt/mytempdirs", exceptions });

// You can clear the cache before start using it to prevent keeping old content
await cache.clear();

const isRequestCached = await cache.contains(req); // req is a Puppeteer HTTPRequest object
if (!isRequestCached) await cache.add(req); // Won't be added if it's in 'exceptions'!
const cachedResponse = await cache.get(req);
// And then you can respond with this cached item
req.respond(cachedResponse);
```

### Settings

These are all optional

- ```path``` - where to host the hidden .tt-collie temp directory; if not specified it will use root directory
- ```exceptions``` - URL parts to exclude (indexOf >= 0) So when invoking ```add``` if it meets any of these exceptions **it won't be added**

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
