
const wait = require("./wait");

const clickAndWait = async function clickAndWait (page, clickableSelector, waitForSelector, retries = 10) {
  for (let i = 0; i < retries; i++) {
    try {
      const [item] = await page.$x(clickableSelector);
      if (item) {
        await Promise.all([page.waitForNavigation({ timeout: 10000 }), item.click({ timeout: 10000 })]);
        await wait(2000, 2000);
        if (await page.waitForXPath(waitForSelector, { timeout: 10000 })) return; // Finish when clicked and video card is there
      } else {
        await wait(2000, 2000);
      }
    } catch (err) {
      if (err.message.indexOf("timeout") > 0) continue; // Expected error, try again!
      else throw err;
    }
  }
  throw { code: "TOO_MANY_RETRIES", message: `Too many retries (${retries}) trying to click` };
};

module.exports = clickAndWait;
