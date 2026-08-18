const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 5000,

  clientUrl: process.env.CLIENT_URL,

  mongoUri: process.env.MONGO_URI,

  jwtSecret: process.env.JWT_SECRET,

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",

  cloudinaryCloudName:
    process.env.CLOUDINARY_CLOUD_NAME,

  cloudinaryApiKey:
    process.env.CLOUDINARY_API_KEY,

  cloudinaryApiSecret:
    process.env.CLOUDINARY_API_SECRET,

  appTimezone:
    process.env.APP_TIMEZONE || "Asia/Kolkata",
};

const requiredVariables = [
  "clientUrl",
  "mongoUri",
  "jwtSecret",
  "cloudinaryCloudName",
  "cloudinaryApiKey",
  "cloudinaryApiSecret",
];

for (const variable of requiredVariables) {
  if (!env[variable]) {
    throw new Error(
      `Missing required environment variable: ${variable}`
    );
  }
}

if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
  throw new Error("PORT must be a valid port number");
}

module.exports = env;