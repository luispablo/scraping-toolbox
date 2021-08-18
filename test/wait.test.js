
const test = require("ava");
const { wait } = require("../index");

test("wait 80ms", async function (t) {
  const init = new Date().getTime();
  await wait(80, 20);
  const elapsedTime = new Date().getTime() - init;
  t.true(elapsedTime > 80 && elapsedTime < 100);
});
