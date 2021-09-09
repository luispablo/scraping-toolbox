
// This function makes a random delay on EACH character typed
const humanType = async function humanType (element, text) {
  const characters = text.split("");
  for (const character of characters) {
    await element.type(character, { delay: 120 + 60 * Math.random() });
  }
};

module.exports = humanType;
