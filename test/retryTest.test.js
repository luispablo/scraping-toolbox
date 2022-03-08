
const puppeteer = require("puppeteer");
const test = require("ava");

const { retryTest } = require("../index");

test.before(async function (t) {
  const browser = await puppeteer.launch({ headless: true });
  t.context = { browser };
});

test("Retry twice", async function (t) {
  let retries = 0;
  await retryTest(async function () {
    retries++;
    if (retries === 1) throw new Error("ERR_TIMED_OUT");
  });
  t.is(retries, 2);
});

test("Retry more than default", async function (t) {
  let retries = 0;
  const retryableMessages = [
    "ERR_TIMED_OUT",
    "Response body is unavailable for redirect responses",
    "Protocol error (Runtime.callFunctionOn): Session closed. Most likely the page has been closed.",
    "Navigation failed because browser has disconnected!"
  ];
  try {
    await retryTest(async function () {
      retries++;
      throw new Error(retryableMessages[retries - 1]);
    }, { retries: 6 });
    t.fail("Shouldn't get here");
  } catch (err) {
    t.is(retries, 5);
  }
});

test("Don't retry unexpected errors", async function (t) {
  let retries = 0;
  try {
    await retryTest(async function () {
      retries++;
      throw new Error("Shouldn't be retried");
    });
    t.fail("Shouldn't get here");
  } catch (err) {
    t.is(retries, 1);
  }
});

test("Custom retryable error", async function (t) {
  let retries = 0;
  try {
    await retryTest(async function () {
      retries++;
      if (retries === 0) throw new Error("Custom retryable");
      else throw new Error("ERR_TIMED_OUT");
    }, { isRetryable: err => err.message === "Custom retryable" });
    t.fail("Shouldn't get here");
  } catch (err) {
    t.is(retries, 3);
  }
});

test("Custom retries", async function (t) {
  let retries = 0;
  try {
    await retryTest(async function () {
      retries++;
      throw new Error("ERR_TIMED_OUT");
    }, { retries: 7 });
    t.fail("Shouldn't get here");
  } catch (err) {
    t.is(retries, 7);
  }
});
