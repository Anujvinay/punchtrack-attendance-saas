const mongoose = require("mongoose");
const logger = require("../utils/logger");
const env = require("./env");

const connectDatabase = async () => {
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection failed", {
      message: error.message,
      stack: error.stack,
    });

    throw error;
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();

    logger.info("MongoDB disconnected successfully");
  } catch (error) {
    logger.error("MongoDB disconnection failed", {
      message: error.message,
      stack: error.stack,
    });

    throw error;
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
};