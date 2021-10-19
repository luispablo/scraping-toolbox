
const DEFAULT_RETRIES = 3;

const defaultRetryable = function defaultRetryable (error) {
  return error && error.message && (
    error.message.indexOf("ERR_TIMED_OUT") >= 0 ||
    error.message.indexOf("Navigation timeout") >= 0
  );
};

const defaultOptions = { retries: DEFAULT_RETRIES, isRetryable: defaultRetryable };

const retryTest = async function retryTest (testFn, options = defaultOptions) {
  const retries = options.retries || DEFAULT_RETRIES;
  const isRetryable = options.isRetryable || defaultRetryable;

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
