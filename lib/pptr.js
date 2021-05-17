
// Simplify getting puppeteer elements content
const prop = async function prop (element, propertyName) {
  const propertyHandle = await element.getProperty(propertyName);
  return await propertyHandle.jsonValue();
};

const pptr = { prop };

module.exports = pptr;
