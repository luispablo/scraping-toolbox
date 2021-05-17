
const wait = function wait (msBase, msRandom = 1000) {
  const msTotal = msBase + Math.random() * msRandom;
  return new Promise(resolve => setTimeout(() => resolve(), msTotal));
};

module.exports = wait;
