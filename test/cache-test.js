
const { buildCache } = require("../index");
const { access, rmdir } = require("fs/promises");
const test = require("ava");

test.before(async function (t) {
  await rmdir("./test/cache", { recursive: true });
  const cache = await buildCache("./test");
  const res1 = { headers: () => ({ "Content-Type": "text/plain" }), text: () => "js file content" };
  const req1 = { url: () => "https://www.socmed.com/static/yourfile.js", response: () => res1 };
  const req1Filename = `./test/cache/${req1.url().replace(/\//g, "_")}`;
  t.context = { cache, req1, req1Filename };
});

test.serial("contains / add", async function (t) {
  const { cache, req1, req1Filename } = t.context;
  await t.throwsAsync(async () => await access(req1Filename));
  t.false(await cache.contains(req1));
  await cache.add(req1);
  await access(req1Filename);
  t.true(await cache.contains(req1));
});

test.serial("get", async function (t) {
  const { cache, req1 } = t.context;
  const cachedResponse = await cache.get(req1);
  t.deepEqual(cachedResponse.body.toString(), req1.response().text());
  t.deepEqual(cachedResponse.headers, req1.response().headers());
  t.is(cachedResponse.status, 200);
});

test.serial("clear", async function (t) {
  const { cache, req1Filename } = t.context;
  await cache.clear();
  await t.throwsAsync(async () => await access(req1Filename));
});
