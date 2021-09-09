
const fs = require("fs");

const close = async function close (browser) {
  const [tempDataDirectory] = browser.process().spawnargs.filter(a => a.indexOf("--user-data-dir") === 0).map(a => a.split("=")[1]);
  const pages = await browser.pages();
  for (const page of pages) if (!page.isClosed()) await page.close();
  if (browser.isConnected()) await browser.close();
  if (browser && browser.process() !== null) browser.process().kill("SIGINT");
  fs.rmdirSync(tempDataDirectory, { recursive: true }); // Faisafe mechanism in case /tmp files don't get deleted
};

// Simplify getting puppeteer elements content
const prop = async function prop (element, propertyName) {
  const propertyHandle = await element.getProperty(propertyName);
  return await propertyHandle.jsonValue();
};

const pptr = {
  close,
  prop
};

module.exports = pptr;
