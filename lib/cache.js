
const { accessSync, mkdirSync, readFileSync, rmdirSync, writeFileSync } = require("fs");

const buildCache = async function buildCache (basePath) {

  const cachePath = `${basePath}/cache`;
  const cachedEntries = [];

  await mkdirSync(cachePath, { recursive: true });

  const filename = req => `${cachePath}/${req.url().replace(/\//g, "_")}`;

  const isCacheable = function (req) {
    const url = req.url().toLowerCase();
    const isJS = url.endsWith(".js") || url.endsWith(".js?cache") || url.endsWith(".js?async");
    return isJS;
  };

  const clear = async function clear () {
    await rmdirSync(cachePath, { recursive: true });
    await mkdirSync(cachePath, { recursive: true });
  };

  const contains = async function contains (req) {
    try {
      // First fast local check (to be able to abort request on time!)
      const entryFilename = filename(req);
      if (cachedEntries.indexOf(entryFilename) >= 0) {
        return true;
      } else {
        await accessSync(filename(req));
        cachedEntries.push(entryFilename);
        return true;
      }
    } catch (err) {
      return false;
    }
  };

  const add = async function add (req) {
    if (isCacheable(req)) {
      if (!await contains(req)) {
        const entryFilename = filename(req);
        const response = req.response();
        await writeFileSync(entryFilename, await response.text());
        await writeFileSync(`${entryFilename}_headers`, JSON.stringify(response.headers()));
        cachedEntries.push(entryFilename);
      }
    }
  };

  const get = async function get (req) {
    const entryFilename = filename(req);
    const body = await readFileSync(entryFilename);
    const headers = JSON.parse(await readFileSync(`${entryFilename}_headers`));
    return { status: 200, headers, body };
  };

  return {
    add,
    clear,
    contains,
    get
  };
};

module.exports = buildCache;
