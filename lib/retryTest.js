
const RETRYABLE_MESSAGES = [
  "ERR_TIMED_OUT",
  "Navigation timeout",
  "Cannot read property \'getProperty\' of undefined",
  "Response body is unavailable for redirect responses",
  "Protocol error (Runtime.callFunctionOn): Session closed. Most likely the page has been closed."
];

const DEFAULT_RETRIES = 3;

const defaultRetryable = function defaultRetryable (error) {
  return error && error.message && RETRYABLE_MESSAGES.some(m => error.message.indexOf(m) >= 0);
};

const defaultOptions = { retries: DEFAULT_RETRIES, isRetryable: defaultRetryable };

const retryTest = async function retryTest (testFn, options = defaultOptions) {
  const retries = options.retries || DEFAULT_RETRIES;
  const isRetryable = err => defaultRetryable(err) || (options.isRetryable && options.isRetryable(err));

  let completed = false
  
  for (let i = 0; i < retries && !completed; i++) {
    try {
      await testFn();
      completed = true;
    } catch (err) {
      if (isRetryable(err)) completed = false;
      else throw err;
    }
  }
  if (!completed) throw new Error(`Too many test retries (${retries})`);
};

module.exports = retryTest;
