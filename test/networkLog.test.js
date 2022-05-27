
const puppeteer = require("puppeteer");
const test = require("ava");

const { createNetworkLog } = require("../index");

test.before(async function (t) {
  const browser = await puppeteer.launch({ headless: true });
  t.context = { browser };
});

test("Log requests and responses and build report", async function (t) {
  const { browser } = t.context;
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  const networkLog = createNetworkLog({ page });
  await page.goto("https://duckduckgo.com/");
  const requests = networkLog.getRequests();
  const responses = networkLog.getResponses();
  t.true(requests.length > 0, `Must have at least one request, but has ${requests.length}`);
  t.true(responses.length > 0, `Must have at least one respones, but has ${responses.length}`);
  const reportLines = networkLog.getReport().split("\n");
  t.true(reportLines[0].startsWith("TOTAL"));
  t.is(reportLines.length, requests.length + responses.length + 1);
  reportLines.forEach(l => t.true(reportLines[0].startsWith("TOTAL") || l.startsWith("REQ") || l.startsWith("RES")));
});

test("Custom request listener", async function (t) {
  const { browser } = t.context;
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  const networkLog = createNetworkLog({ page, onRequest: req => req.continue() });
  await page.goto("https://duckduckgo.com/");
  const requests = networkLog.getRequests();
  const responses = networkLog.getResponses();
  t.true(requests.length > 0, `Must have at least one request, but has ${requests.length}`);
  t.true(responses.length > 0, `Must have at least one respones, but has ${responses.length}`);
});

test("Custom request listener blocking", async function (t) {
  const { browser } = t.context;
  const page1 = await browser.newPage();
  await page1.setRequestInterception(true);
  const networkLog1 = createNetworkLog({ page: page1, onRequest: req => req.continue() });
  await page1.goto("https://developer.mozilla.org/en-US/");
  const responses1 = networkLog1.getResponses();

  const page2 = await browser.newPage();
  await page2.setRequestInterception(true);
  const networkLog2 = createNetworkLog({ page: page2, onRequest: req => {
    if (req.resourceType() !== "script") req.continue();
    else req.abort();
  }});
  await page2.goto("https://developer.mozilla.org/en-US/");
  const responses2 = networkLog2.getResponses();

  t.true(responses1.length > responses2.length, `Log 1 should have more responses (${responses1.length}) than log 2 (${responses2.length})`);
});
