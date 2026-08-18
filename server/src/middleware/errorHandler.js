const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error("Request failed", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    stack: err.stack,
  });

  const response = {
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : err.message,
  };

  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    response.error = err.message;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;