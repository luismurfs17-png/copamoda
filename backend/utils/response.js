function sendSuccess(res, data, message = "OK", status = 200) {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
}

module.exports = { sendSuccess };
