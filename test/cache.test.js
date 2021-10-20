
const { buildCache, wait } = require("../index");
const { access, readdir, rmdir, unlink } = require("fs/promises");
const test = require("ava");

test.before(async function (t) {
  await rmdir("./test/cache", { recursive: true });
  const cache = await buildCache({ path: "./test" });
  const res1 = { headers: () => ({ "Content-Type": "text/plain" }), text: () => "js file content" };
  const req1 = { url: () => "https://www.socmed.com/static/yourfile.js", response: () => res1 };
  const req1Filename = `./test/cache/${req1.url().replace(/\//g, "_")}`;
  t.context = { cache, req1, req1Filename, res1 };
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

test("exceptions", async function (t) {
  const { res1 } = t.context;
  const cache = await buildCache({ path: "./test", exceptions: ["file1.js"] });

  const req1 = { url: () => "https://www.socmed.com/static/file1.js", response: () => res1 };
  const req2 = { url: () => "https://www.socmed.com/static/file2.js", response: () => res1 };

  await cache.add(req1);
  await cache.add(req2);

  t.false(await cache.contains(req1), "This file is in exceptions");
  t.true(await cache.contains(req2), "This file is not in exceptions");

  const error = await t.throwsAsync(() => cache.get(req1));
  t.is(error.message, "ENOENT: no such file or directory, stat \'./test/cache/https:__www.socmed.com_static_file1.js\'");
});

test("contains checks physical files", async function (t) {
  const cache = await buildCache({ path: "./test/cache_02" });
  const res1 = { headers: () => ({ "Content-Type": "text/plain" }), text: () => "js file content" };
  const req1 = { url: () => "https://www.socmed.com/static/yourfile.js", response: () => res1 };
  await cache.add(req1);
  t.true(await cache.contains(req1));
  const files = await readdir("./test/cache_02/cache");
  for (const file of files) await unlink(`./test/cache_02/cache/${file}`);
  t.false(await cache.contains(req1), "When file deleted, cache doesn't contain it anymore");
  await rmdir("./test/cache_02", { recursive: true });
});

test("Max entry age", async function (t) {
  const cache = await buildCache({ path: "./test/cache_03", maxAge: 200 });
  const res1 = { headers: () => ({ "Content-Type": "text/plain" }), text: () => "js file content" };
  const req1 = { url: () => "https://www.socmed.com/static/yourfile.js", response: () => res1 };
  await cache.add(req1);
  t.true(await cache.contains(req1));
  await wait(300, 0);
  t.false(await cache.contains(req1), "Already expired");

  await cache.add(req1);
  const cachedResponse1 = await cache.get(req1);
  t.not(cachedResponse1, null);
  await wait(300, 0);
  const cachedResponse2 = await cache.get(req1);
  t.is(cachedResponse2, null, "Already expired");
});
