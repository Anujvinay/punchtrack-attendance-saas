const authService = require("../services/authService");
const env = require("../config/env");

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite:
    env.nodeEnv === "production"
      ? "none"
      : "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
});

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);

    res.cookie(
      "accessToken",
      result.token,
      getCookieOptions()
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite:
        env.nodeEnv === "production" ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated user",
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive,
      },
    },
  });
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};