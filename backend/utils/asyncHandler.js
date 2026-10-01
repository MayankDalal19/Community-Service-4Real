// Wraps async controllers so any thrown error reaches the global error handler.
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
