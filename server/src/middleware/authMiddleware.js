const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const env = require("../config/env");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return next(
        new AppError("Authentication required. Please log in.", 401)
      );
    }

    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.sub);

    if (!user) {
      return next(
        new AppError(
          "The user belonging to this token no longer exists.",
          401
        )
      );
    }

    if (!user.isActive) {
      return next(
        new AppError(
          "Your account has been deactivated. Please contact admin.",
          401
        )
      );
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(
        new AppError("Invalid token. Please log in again.", 401)
      );
    }

    if (error.name === "TokenExpiredError") {
      return next(
        new AppError(
          "Your session has expired. Please log in again.",
          401
        )
      );
    }

    next(error);
  }
};

module.exports = {
  authMiddleware,
};