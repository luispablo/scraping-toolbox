
const dotenv = require("dotenv");
const test = require("ava");

const { pptr } = require("../index");

test.before(async function (t) {
  dotenv.config({ path: "test/.env" });
  const debug = process.env.DEBUG.toLowerCase().trim() === "true";
  const useProxy = process.env.USE_PROXY.toLowerCase().trim() === "true";
  const proxy = useProxy && { url: process.env.PROXY_URL, username: process.env.PROXY_USER, password: process.env.PROXY_PASS };
  t.context = { debug, proxy };
});

test("Launch new browser", async function (t) {
  const { debug, proxy } = t.context;
  const { browser, page } = await pptr.launch(proxy, { debug });
  await page.goto("https://duckduckgo.com/");
  const [input] = await page.$x("//input[@type = 'text']");
  t.is(typeof(browser.process().pid), "number");
  t.truthy(input);
});
