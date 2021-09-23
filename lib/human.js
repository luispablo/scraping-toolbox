
const { prop } = require("./pptr");

const randomDelay = () => 120 + 60 * Math.random();

// This function makes a random delay on EACH character typed
const humanType = async function humanType (element, text) {
  const characters = text.split("");
  for (const character of characters) {
    await element.type(character, { delay: randomDelay() });
  }
};

const humanDeleteText = async function humanDeleteText (page, element) {
  const inputValue = await prop(element, "value");
  await element.focus();
  for (let i = 0; i < inputValue.length; i++) {
    await page.keyboard.press("Backspace", { delay: randomDelay() });
  }
};

const human = {
  deleteText: humanDeleteText,
  type: humanType
};

module.exports = human;
