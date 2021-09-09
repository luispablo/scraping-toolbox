
const scrollInBrowser = async function scrollInBrowser (step, delay, infinite = false) {
  const getScrollHeight = function getScrollHeight () {
    const { body } = document;
    if (!body) return 0;
    const { scrollHeight, offsetHeight, clientHeight } = body;
    return Math.max(scrollHeight, offsetHeight, clientHeight);
  };

  const position = await new Promise(async function (resolve) {
    let availableScrollHeight = getScrollHeight();
    for (let i = 0; i < availableScrollHeight; ) {
      const currentStep = step / 2 + Math.random() * (step / 2);
      const currentDelay = Math.random() * delay;
      window.scrollBy(0, currentStep);
      i += currentStep;
      await new Promise(res => setTimeout(res, currentDelay));
      if (infinite) availableScrollHeight = getScrollHeight();
    }
    resolve(i);
  });
  return position;
};

const scrollPageToBottom = async function scrollPageToBottom ({ page, scrollStep = 200, scrollDelay = 1000, infinite = false }) {
  const lastPosition = await page.evaluate(scrollInBrowser, scrollStep, scrollDelay, infinite);
  return lastPosition;
};

module.exports = scrollPageToBottom;
