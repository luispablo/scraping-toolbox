
const puppeteer = require("puppeteer");
const test = require("ava");

const { clickAndWait } = require("../index");

test.before(async function (t) {
  const browser = await puppeteer.launch({ headless: true });
  t.context = { browser };
});

test("Wait for non-existent element", async function (t) {
  const { browser } = t.context;
  const page = await browser.newPage();

  try {
    await page.goto("https://9to5linux.com/");
    await clickAndWait(page, "//main//article//h2//a", "//article//header//h1[@id = 'INVALID-ID']");
  } catch (err) {
    t.is(err.code, "TOO_MANY_RETRIES");
  } finally {
    await page.close();
  }
});

test("Wait for 1 element", async function (t) {
  const { browser } = t.context;
  const page = await browser.newPage();
  await page.goto("https://ubunlog.com/");
  const postTitle = await clickAndWait(page, "//article//header//h2//a", "//article//header//h1[@class = 'post-title']");
  t.is(postTitle.toString(), "JSHandle@node");
  await page.close();
});

test("Wait for any of n elements", async function (t) {
  const { browser } = t.context;
  const page = await browser.newPage();
  await page.goto("https://www.muylinux.com/");
  const [cookiesButton] = await page.$x("//button[. = 'ACEPTO']");
  if (cookiesButton) await cookiesButton.click();
  const waitedElements = ["//p[@id = 'INVALID-ID']", "//header//div[@class = 'zox-post-info-wrap']"];
  const element = await clickAndWait(page, "//div[@class = 'zox-art-title']//a[@rel = 'bookmark']", waitedElements);
  const className = await (await element.getProperty("className")).jsonValue();
  t.is(className, "zox-post-info-wrap");
  await page.close();
});

test.after(async function (t) {
  const { browser } = t.context;
  await browser.close();
});
