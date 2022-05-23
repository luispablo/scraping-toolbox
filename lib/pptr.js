
const puppeteer = require("puppeteer-extra");
const puppeteerStealth = require("puppeteer-extra-plugin-stealth");
const proxyChain = require("proxy-chain");

const { rmdir } = require("fs/promises");

const launch = async function launch (proxy, { debug, timeout = 60 }) {
  const args = [
    "--disable-gpu", 
    "--disable-dev-shm-usage", 
    "--disable-setuid-sandbox", 
    "--lang=en-US,en",
    "--no-first-run", 
    "--no-sandbox", 
    "--no-zygote", 
    debug ? "" : "--single-process", 
    "--ignore-certificate-errors", 
    "--ignore-certificate-errors-spki-list", 
    "--enable-features=NetworkService"
  ];

  if (proxy && proxy.url) {
    const localProxyURL = await proxyChain.anonymizeProxy(proxy.url);
    args.push(`--proxy-server=${localProxyURL}`);
  }

  puppeteer.use(puppeteerStealth());

  // add timeout: 0 and headless: false for debugging
  const browser = await puppeteer.launch({ 
    headless: !debug, 
    ignoreHTTPSErrors: true, 
    acceptInsecureCerts: true, 
    args, 
    timeout: timeout * 1000 
  });
  const page = await browser.newPage();

  if (proxy && proxy.username && proxy.password) await page.authenticate(proxy);

  return { browser, page };
};

const close = async function close (browser) {
  const [tempDataDirectory] = browser.process().spawnargs.filter(a => a.indexOf("--user-data-dir") === 0).map(a => a.split("=")[1]);
  const pages = await browser.pages();
  for (const page of pages) {
    try {
      if (browser.isConnected() && !page.isClosed()) await page.close();
    } catch (err) {
      console.error(err);
    }
  }
  try {
    if (browser.isConnected()) {
      await new Promise(async function closePromise (resolve, reject) {
        const closeTimeoutID = setTimeout(reject, 10000);
        await browser.close();
        clearTimeout(closeTimeoutID);
        resolve();
      });
    }
  } catch (err) {
    console.error(err);
  }
  if (browser && browser.process() !== null) browser.process().kill("SIGINT"); // Browser MUST be closed
  try {
    rmdir(tempDataDirectory, { recursive: true }); // Faisafe mechanism in case /tmp files don't get deleted
  } catch (err) {
    if (err.code !== "ENOENT") throw err; // Nothing to do on else, given the directory is already gone
  }
};

// Simplify getting puppeteer elements content
const prop = async function prop (element, propertyName) {
  const propertyHandle = await element.getProperty(propertyName);
  return await propertyHandle.jsonValue();
};

const pptr = {
  launch,
  close,
  prop
};

module.exports = pptr;
