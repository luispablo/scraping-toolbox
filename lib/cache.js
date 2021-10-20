
const { access, stat, unlink } = require("fs/promises");
const { mkdirSync, readFileSync, rmdirSync, writeFileSync } = require("fs");

const buildCache = async function buildCache ({ exceptions = [], maxAge = 21600000, path }) {

  const cachePath = `${path}/cache`;

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

  const isExpired = async function isExpired (entryFilename) {
    const { ctimeMs } = await stat(entryFilename);
    const currentMs = new Date().getTime();
    const expired = (currentMs - ctimeMs) > maxAge;
    if (expired) await unlink(entryFilename);
    return expired;
  };

  const contains = async function contains (req) {
    try {
      const entryFilename = filename(req);
      await access(entryFilename);
      return !(await isExpired(entryFilename));
    } catch (err) {
      return false;
    }
  };

  const add = async function add (req) {
    if (isCacheable(req) && !exceptions.some(e => req.url().indexOf(e) >= 0)) {
      if (!await contains(req)) {
        try {
          const entryFilename = filename(req);
          const response = req.response();
          await writeFileSync(entryFilename, await response.text());
          await writeFileSync(`${entryFilename}_headers`, JSON.stringify(response.headers()));
        } catch (err) {
          if (err.message.indexOf("No resource with given identifier found") > 0) return; // Can happen once in a while, we can live with it
          else throw err;
        }
      }
    }
  };

  const get = async function get (req) {
    const entryFilename = filename(req);
    if (await isExpired(entryFilename)) {
      return null;
    } else {
      const body = await readFileSync(entryFilename);
      const headers = JSON.parse(await readFileSync(`${entryFilename}_headers`));
      return { status: 200, headers, body };
    }
  };

  return {
    add,
    clear,
    contains,
    get
  };
};

module.exports = buildCache;
