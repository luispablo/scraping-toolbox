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

### Get an element property value

```javascript
const { pptr } = require("scraping-toolbox");

const [anchor] = await page.$x("//a");
const href = await pptr.prop(anchor, "href");
```

### Close (but REALLY close) the browser

It closes all pages, the browser, kills the process (if needed) and removes all temporary files.

```javascript
const { pptr } = require("scraping-toolbox");

await pptr.close(browser);
```

## wait

```javascript
const { wait } = require("scraping-toolbox");

// Wait 80ms, plus a random number between 0 and 20 additional milliseconds
await wait(80, 20); 
```

## Click and wait

Click on an XPath defined item, and wait for another XPath defined item to appear, retrying n times before failing on too many retries.

```javascript
const { clickAndWait } = require("scraping-toolbox");

const clickableItemXPath = "//div[.='opi']//ancestor::a[contains(@href, 'opi')]";
const waitForItemXPath = "//main//header//h2[.='opi']";
const retries = 5;
await clickAndWait(page, clickableItemXPath, waitForItemXPath, retries);
```

## Scroll to bottom

Scroll down the browser page, reaching bottom. It can keep scrolling if more content is loaded when approaching the bottom (infinite scroll) or not, based on a parameter.

```javascript
const { scrollPageToBottom } = require("scraping-toolbox");

const scrollStep = 350; // How much to move on each step (default 200)
const scrollDelay = 2000; // Milliseconds to wait between each scrolling step (default 1000)
await scrollPageToBottom({ page, scrollStep, scrollDelay, infinite: false });
```

Both ```scrollStep``` and ```scrollDelay``` are randomized for each iteration, to mimic human behavior.

## Human-like operations

These operations mimic human behavior.

### Typing

Types in, character by character, using a randomized wait between each one: 120 ms + 60 ms * random.

```javascript
const { human } = require("scraping-toolbox");

const [searchInput] = await page.$x("//nav//input[@type='text']");
await human.type(searchInput, "some_username");
```

### Deleting input text content

Similar to typing.

```javascript
const { human } = require("scraping-toolbox");

const [searchInput] = await page.$x("//nav//input[@type='text']");
await human.deleteText(searchInput);
```

### Scrolling

```javascript
const { human } = require("scraping-toolbox");
const scroller = human.createScroller(page); // Creates a scroller with random mouse wheel or keyboard feature
await scroller.move("down"); // Or "up"; randomly moves in the given direction
```
