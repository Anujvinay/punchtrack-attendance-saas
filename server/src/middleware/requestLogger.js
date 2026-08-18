const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs =
      Number(process.hrtime.bigint() - startTime) / 1_000_000;

    logger.info("HTTP request", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: req.ip,
    });
  });

  next();
};

module.exports = requestLogger;