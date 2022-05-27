# scraping-tools
Common lib &amp; utils for our web scrappers

## cache

```javascript
const { buildCache } = require("scraping-toolbox");

const exceptions = ["very-important1.js", "very-important2.js"];
const cache = await buildCache({ path: "/opt/mytempdirs", exceptions, maxAge: 300000 });

// You can clear the cache before start using it to prevent keeping old content
await cache.clear();

// If you want an EXACT name match (**)
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
- ```maxAge``` - Maximum cache entry age in millis (defaults to **21600000** = 6 hours) After this time the cache entry is discarded

### ** cache similar names instead of exact name match 

```javascript
const requestMatches = await cache.matches(req);

// This would return something like:
// [
//   { filename: "https:__lf16-tiktok-web.ttwstatic.com_obj_tiktok-web_tiktok_webapp_login_common_vendor.0992bd4f.js", score: 0.9411764705882353, isExpired: false },
//   { filename: "https:__lf16-tiktok-web.ttwstatic.com_obj_tiktok-web_tiktok_webapp_login_index.685d65b6.js", score: 0.8125, isExpired: false },
//   { filename: "https:__sf16-unpkg-va.ibytedtos.com_slardar_sdk-lite_0.4.9_dist_plugins_perf.0.4.9.maliva.js", score: 0.14285714285714285, isExpired: false },
// ];
// and you could consider any match with a score over 0.9 / 0.95, and take the highest score of them. No match above 0.9 would be no match at all.

const validMatches = requestMatches.filter(m => m.score > 0.9);
if (validMatches.length > 0) {
  const match = maxBy(validMatches, "score");
} else {
  // no match!
}
```

## pptr

### Launch new browser instance

This function internally uses the modules **puppeteer-extra-plugin-stealth** and **proxy-chain** to help in the anonimization and preventing the proxy detection.

```javascript
  const { pptr } = require("scraping-toolbox");

  const proxy = { url: "http://yourproxyserver.com", username: "yourproxyuser", password: "yourproxypass" };
  const { browser, page } = await pptr.launch(proxy, { debug: true, timeout: 120 });
```

- ```debug``` is optional, **false** by default
- ```timeout``` 60 seconds by default

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

## Network logging

This was created to have an approximate number of the bandwidth consumed by the scraper.

```javascript
  // [...]
  const page = await browser.newPage();

  // ATTENTION - It won't work without this turned on
  await page.setRequestInterception(true);

  const myCustomRequestListener = function myCustomRequestListener (req) {
    req.continue();
  };

  // If you want to listen to requests, provide your listener,
  //  otherwise, the request will always continue
  const networkLog = createNetworkLog({
    onRequest: myCustomRequestListener
    page,
  });
  // Now it'll record all requests & responses

  // At any time you can get the requests or responses
  const requests = networkLog.getRequests();
  const responses = networkLog.getResponses();

  // And, finally, you can get a complete report
  console.log(networkLog.getReport());
```

This report will give you something similar to this:

```
TOTAL          376.6 k
RES script     152.3 k https://sf16-secsdk.ttwstatic.com/obj/rc-web-sdk-gcs/webmssdk/1.0.0.260/webmssdk.js
RES fetch         27 k https://m.tiktok.com/api/post/item_list/?aid=1988&app_language=en&app_name=tiktok_we...RUIMFK8W6HLr2AAMNmd5
RES fetch       26.9 k https://m.tiktok.com/api/post/item_list/?aid=1988&app_language=en&app_name=tiktok_we...RUIMFK8W6HLr2AAMNmd5
RES script      21.1 k https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/video.4cab71fa61ab9840e4a6.js
RES script      19.5 k https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/user.2081cfe02babc8aa4cbc.js
RES script      11.7 k https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/592.9c47d3ead92678133753.js
RES script      11.2 k https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/npm-596046b7.6b72c9c1ab0b84bb2852.js
RES fetch        8.9 k https://www.tiktok.com/node/share/discover?aid=1988&app_language=en&app_name=tiktok_we...yhWat6D37qdsAABx9a9
RES script       4.6 k https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/9444.f3ab06e7ef27cef1a6a4.js
RES script       3.8 k https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/npm-async-87e0bff3.8ed23d04d147801fc049.js
RES script       3.4 k https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/runtime.b30730d544ad6b39538e.js
RES script       3.2 k https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/npm-async-abee7817.472956d30d9711a197e7.js
RES script       1.1 k https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/3114.c5127124dfc0006d1732.js
RES script       1.1 k https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/npm-async-897bfa5e.ac0978f763558f44d4af.js
RES xhr            968 https://www.tiktok.com/node/common/web-privacy-config?lang=en
RES script         724 https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/8229.b6b320db382629c77340.js
RES fetch          711 https://www.tiktok.com/api/user/detail/?aid=1988&app_language=en&app_name=tiktok_we...AswNxJggLH524SZiAAAyEcc
RES script         525 https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/npm-async-ea8a6886.a271a61396e460f4e221.js
RES script         455 https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/9894.0daa22a35a9807b2d9be.js
RES fetch          451 https://firebaseinstallations.googleapis.com/v1/projects/byted-ucenter/installations
RES script         413 https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/4414.677fa913da4154105c77.js
RES script         382 https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/npm-async-596046b7.c34282adfbaef6bd010b.js
RES manifest       254 https://www.tiktok.com/manifest.json
RES script         133 https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/npm-async...MyhWavy9n7qdsAABx9a2
RES xhr             63 https://www.tiktok.com/ttwid/check/
RES xhr             58 https://mcs-va.tiktok.com/v1/user/webid
RES xhr             58 https://mcs-va.tiktokv.com/v1/user/webid
RES xhr             44 https://mssdk-va.tiktok.com/web/report?msToken=MtTy5C1mfRjBJ5oiE8IV4Bb0NvbuIjTasUECuHVTXEq6EXjbgExBTi1wEhWF-pV4qVWEGi8u...w1qQst/6ef2
RES xhr             21 https://www.tiktok.com/cloudpush/app_notice_status/
RES other           18 https://m.tiktok.com/api/post/item_list/?aid=1988&app_language=en&app_name=tiktok_web&battery_info=0.82...UIMFK8W6HLr2AAMNmd5
RES other           18 https://m.tiktok.com/api/post/item_list/?aid=1988&app_language=en&app_name=tiktok_web&battery_info=0.82...UIMFK8W6HLr2AAMNmd5
RES xhr              7 https://mcs-va.tiktok.com/v1/list
RES xhr              7 https://mcs-va.tiktok.com/v1/list
RES xhr              7 https://mcs-va.tiktok.com/v1/list
RES xhr              7 https://mcs-va.tiktokv.com/v1/list
RES xhr              7 https://mcs-va.tiktokv.com/v1/list
REQ document         ? https://www.tiktok.com/@munchie.michelle/video/7088076344474520875
REQ script           ? https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/runtime.b30730d544ad6b39538e.js
REQ script           ? https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/npm-74d9c565.703ac0fe9e85d00db81d.js
REQ script           ? https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/npm-async-87e0bff3.8ed23d04d147801fc049.js
REQ script           ? https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/4414.677fa913da4154105c77.js
REQ script           ? https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web-us/tiktok/webapp/main/webapp-desktop/215.ba2cf15440367031ccbe.js
```

(? means the request or response didn't have ```Content-length``` header)

## wait

```javascript
const { wait } = require("scraping-toolbox");

// Wait 80ms, plus a random number between 0 and 20 additional milliseconds
await wait(80, 20); 
```

## Click and wait

Click on an XPath defined item, and wait for another XPath defined item (or items!) to appear, retrying n times before failing on too many retries.

```javascript
const { clickAndWait } = require("scraping-toolbox");

const clickableItemXPath = "//div[.='opi']//ancestor::a[contains(@href, 'opi')]";
const waitForItemXPath1 = "//main//header//h2[.='opi']";
const retries = 5;
const waitedElement = await clickAndWait(page, clickableItemXPath, waitForItemXPath1, retries);

// You can also wait for any of n possible items, will return the first it finds
const waitForItemXPath2 = "//main//header//h2[.='other-item']";
const anyWaitedElement = await clickAndWait(page, clickableItemXPath, [waitForItemXPath1, waitForItemXPath2]);
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

## Testing tools

### retryTest

Using chrome / Puppeteer, specially through proxies, usually generates random errors, timeouts, etc. This complicates unit testing.

To prevent such issues from breaking your unit tests, you can send your desired test as a function to this helper:

```js
const { retryTest } = require("scraping-toolbox");

const isRetryable = err => err && err.message === "This should be retried too!"; // You can define ADITIONAL retrying conditions

test("Some feature you want to test", async function (t) {
  await retryTest(async function () {
    const { page } = t.context;
    await page.goto("https://somewebsite.co");
    t.is(somevar, "someresult");
  }, { retries: 5, isRetryable });
});
```

The second parameter are optional settings:

```retries```
is 3 by default

```isRetryable```
by default if an error has:
- **ERR_TIMED_OUT**
- **Navigation timeout**
- **Cannot read property \'getProperty\' of undefined**
- **Response body is unavailable for redirect responses**
- **Navigation failed because browser has disconnected!**
- **Protocol error (Runtime.callFunctionOn): Session closed. Most likely the page has been closed.** 
- **Timeout exceeded while waiting for event**

in its message will be retried
