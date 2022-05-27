
const SIZE_COLUMN_WIDTH = 8;

const createNetworkLog = function createNetworkLog ({ onRequest, page }) {

  const requests = [];
  const responses = [];

  page.on("request", function networkLogOnRequest (req) {
    if (onRequest) onRequest(req);
    else req.continue();
  });

  page.on("requestfinished", function networkLogOnRequestFinished (req) {
    requests.push({
      length: req.headers()["content-length"] ? Number.parseInt(req.headers()["content-length"]) : null,
      resourceType: req.resourceType(),
      url: req.url()
    });
  });

  page.on("response", function networkLogOnResponse (res) {
    responses.push({
      length: res.headers()["content-length"] ? Number.parseInt(res.headers()["content-length"]) : null,
      resourceType: res.request().resourceType(),
      url: res.url()
    });
  });

  const formatBytes = function formatBytes (bytes) {
    const textValue = bytes ? (
      bytes / 1024 > 1 ? 
        `${Math.round(bytes / 1024 * 10) / 10} k` :
        `${bytes}`
    ) : "?";
    return textValue.padStart(SIZE_COLUMN_WIDTH);
  };

  const getReport = function getReport () {
    const items = requests.map(r => ({ type: "REQ", ...r })).concat(responses.map(r => ({ type: "RES", ...r })));
    const totalBytes = items.reduce((acc, item) => acc + item.length, 0);
    items.sort((i1, i2) => i2.length - i1.length);
    const rows = items.map(function (item) {
      const resourceType = item.resourceType.padEnd(10);
      return `${item.type} ${resourceType}${formatBytes(item.length)} ${item.url}`;
    });
    return `TOTAL     ${formatBytes(totalBytes)}\n${rows.join("\n")}`;
  };

  return {
    getRequests: () => requests,
    getReport,
    getResponses: () => responses
  };
};

module.exports = createNetworkLog;
