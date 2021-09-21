
const fs = require("fs");

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
    if (browser.isConnected()) await browser.close();
  } catch (err) {
    console.error(err);
  }
  if (browser && browser.process() !== null) browser.process().kill("SIGINT"); // Browser MUST be closed
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
