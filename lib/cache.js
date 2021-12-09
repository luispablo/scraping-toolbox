
const { access, readdir, stat, unlink } = require("fs/promises");
const { mkdirSync, readFileSync, rmdirSync, writeFileSync } = require("fs");

const buildCache = async function buildCache ({ exceptions = [], maxAge = 21600000, path }) {

  const cachePath = `${path}/cache`;

  await mkdirSync(cachePath, { recursive: true });

  const normalizeURL = req => req.url().replace(/\//g, "_");

  const filename = req => `${cachePath}/${normalizeURL(req)}`;

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

  const matchScore = function matchScore (cacheEntryName, name) {
    const cacheEntryTokens = cacheEntryName.split(/_|\.|-/);
    const nameTokens = name.split(/_|\.|-/);
    let points = 0;
    const limit = cacheEntryTokens.length < nameTokens.length ? cacheEntryTokens.length : nameTokens.length;
    for (let i = 0; i < limit; i++) {
      if (cacheEntryTokens[i] === nameTokens[i]) points++;
    }
    return points / cacheEntryTokens.length;
  };

  const matches = async function matches (req) {
    const cachedFilenames = await readdir(cachePath);
    const nonHeaderCachedFilenames = cachedFilenames.filter(filename => !filename.endsWith("_headers"));
    const normalizedURL = normalizeURL(req);
    const scores = await Promise.all(nonHeaderCachedFilenames.map(async function (cachedFilename) {
      return {
        filename: cachedFilename, 
        score: matchScore(cachedFilename, normalizedURL), 
        isExpired: await isExpired(`${cachePath}/${cachedFilename}`)
      };
    }));
    return scores;
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

  const getEntry = async function getEntry (filename) {
    const entryPath = `${cachePath}/${filename}`;
    if (await isExpired(entryPath)) {
      return null;
    } else {
      const body = await readFileSync(entryPath);
      const headers = JSON.parse(await readFileSync(`${entryPath}_headers`));
      return { status: 200, headers, body };
    }
  };

  const get = async function get (req) {
    return getEntry(normalizeURL(req));
  };

  return {
    add,
    clear,
    contains,
    get,
    getEntry,
    matches
  };
};

module.exports = buildCache;
