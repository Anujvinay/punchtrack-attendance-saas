const app = require("./app");
const env = require("./config/env");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const logger = require("./utils/logger");

const PORT = env.port;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Start HTTP Server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    let isShuttingDown = false;

    // 3. Graceful Shutdown Handler
    const shutdown = async (signal) => {
      if (isShuttingDown) {
        return;
      }

      isShuttingDown = true;

      logger.info(
        `${signal} received. Shutting down server gracefully...`
      );

      // Stop accepting new HTTP requests
      server.close(async () => {
        logger.info("HTTP server closed.");

        try {
          // Explicitly close MongoDB connection
          await disconnectDatabase();
          logger.info("Database connection closed.");
          process.exit(0);
        } catch (dbError) {
          logger.error("Error during database disconnection", {
            error: dbError.message,
            stack: dbError.stack,
          });
          process.exit(1);
        }
      });

      // Force shutdown if cleanup takes too long (e.g., 10 seconds)
      setTimeout(() => {
        logger.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

  } catch (error) {
    logger.error("Server startup failed", {
      error: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};

startServer();