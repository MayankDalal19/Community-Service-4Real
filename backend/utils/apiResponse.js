// One consistent JSON shape for every response:
// { success: boolean, message: string, data?: any }

const sendSuccess = (res, data = null, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data });

const sendError = (res, message = 'Something went wrong', status = 500) =>
  res.status(status).json({ success: false, message });

module.exports = { sendSuccess, sendError };
