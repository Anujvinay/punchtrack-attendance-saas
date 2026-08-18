const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Employee = require("../models/Employee");

const AppError = require("../utils/AppError");
const env = require("../config/env");

const generateToken = (id, role) => {
  return jwt.sign(
    {
      sub: id.toString(),
      role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
});

const registerUser = async ({
  name,
  email,
  password,
  employeeId,
  department,
  designation,
  phone,
  joiningDate,
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const normalizedEmployeeId = employeeId.trim().toUpperCase();
  const normalizedDepartment = department.trim();
  const normalizedDesignation = designation.trim();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new AppError("Unable to create account", 409);
  }

  const existingEmployee = await Employee.findOne({
    employeeId: normalizedEmployeeId,
  });

  if (existingEmployee) {
    throw new AppError("Unable to create account", 409);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [user] = await User.create(
      [
        {
          name: name.trim(),
          email: normalizedEmail,
          password,
        },
      ],
      { session }
    );

    const [employee] = await Employee.create(
      [
        {
          user: user._id,
          employeeId: normalizedEmployeeId,
          department: normalizedDepartment,
          designation: normalizedDesignation,
          phone: phone?.trim() || undefined,
          joiningDate,
          status: "active",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return {
      user: sanitizeUser(user),
      employee,
    };
  } catch (error) {
    await session.abortTransaction();

    if (error?.code === 11000) {
      throw new AppError("Unable to create account", 409);
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user || !user.isActive) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    user: sanitizeUser(user),
    token: generateToken(user._id, user.role),
  };
};

module.exports = {
  registerUser,
  loginUser,
};