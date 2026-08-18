const AppError = require("../utils/AppError");

const validateCreateEmployee = (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    employeeId,
    department,
    designation,
    phone,
    joiningDate,
  } = req.body;

  if (
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof role !== "string" ||
    typeof employeeId !== "string" ||
    typeof department !== "string" ||
    typeof designation !== "string" ||
    typeof joiningDate !== "string"
  ) {
    return next(
      new AppError("Invalid employee data", 400)
    );
  }

  const normalizedFirstName = firstName.trim();
  const normalizedLastName = lastName.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = role.trim().toLowerCase();
  const normalizedEmployeeId = employeeId
    .trim()
    .toUpperCase();
  const normalizedDepartment = department.trim();
  const normalizedDesignation = designation.trim();

  // Name
  if (
    normalizedFirstName.length < 2 ||
    normalizedFirstName.length > 100
  ) {
    return next(
      new AppError(
        "First name must be between 2 and 100 characters",
        400
      )
    );
  }

  if (
    normalizedLastName.length < 2 ||
    normalizedLastName.length > 100
  ) {
    return next(
      new AppError(
        "Last name must be between 2 and 100 characters",
        400
      )
    );
  }

  // Email
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!emailRegex.test(normalizedEmail)) {
    return next(
      new AppError("Invalid email address", 400)
    );
  }

  // Role
  if (!["employee", "manager"].includes(normalizedRole)) {
    return next(
      new AppError(
        "Role must be either employee or manager",
        400
      )
    );
  }

  // Password
  if (
    password.length < 8 ||
    password.length > 128
  ) {
    return next(
      new AppError(
        "Password must be between 8 and 128 characters",
        400
      )
    );
  }

  // Employee ID
  if (
    normalizedEmployeeId.length < 2 ||
    normalizedEmployeeId.length > 30
  ) {
    return next(
      new AppError(
        "Employee ID must be between 2 and 30 characters",
        400
      )
    );
  }

  // Department
  if (
    normalizedDepartment.length < 2 ||
    normalizedDepartment.length > 100
  ) {
    return next(
      new AppError(
        "Department must be between 2 and 100 characters",
        400
      )
    );
  }

  // Designation
  if (
    normalizedDesignation.length < 2 ||
    normalizedDesignation.length > 100
  ) {
    return next(
      new AppError(
        "Designation must be between 2 and 100 characters",
        400
      )
    );
  }

  // Phone
  if (phone !== undefined && phone !== null) {
    if (
      typeof phone !== "string" ||
      phone.trim().length < 7 ||
      phone.trim().length > 20
    ) {
      return next(
        new AppError("Invalid phone number", 400)
      );
    }

    req.body.phone = phone.trim();
  }

  // Joining date
  const parsedJoiningDate = new Date(joiningDate);

  if (Number.isNaN(parsedJoiningDate.getTime())) {
    return next(
      new AppError("Invalid joining date", 400)
    );
  }

  req.body.firstName = normalizedFirstName;
  req.body.lastName = normalizedLastName;
  req.body.email = normalizedEmail;
  req.body.role = normalizedRole;
  req.body.employeeId = normalizedEmployeeId;
  req.body.department = normalizedDepartment;
  req.body.designation = normalizedDesignation;
  req.body.joiningDate = parsedJoiningDate;

  next();
};

const validateUpdateEmployee = (req, res, next) => {
  const allowedFields = [
    "department",
    "designation",
    "phone",
    "joiningDate",
  ];

  const receivedFields = Object.keys(req.body);

  const hasInvalidField = receivedFields.some(
    (field) => !allowedFields.includes(field)
  );

  if (hasInvalidField) {
    return next(
      new AppError(
        "Only department, designation, phone and joiningDate can be updated",
        400
      )
    );
  }

  if (receivedFields.length === 0) {
    return next(
      new AppError("No fields provided for update", 400)
    );
  }

  if (req.body.department !== undefined) {
    if (
      typeof req.body.department !== "string" ||
      req.body.department.trim().length < 2 ||
      req.body.department.trim().length > 100
    ) {
      return next(new AppError("Invalid department", 400));
    }

    req.body.department = req.body.department.trim();
  }

  if (req.body.designation !== undefined) {
    if (
      typeof req.body.designation !== "string" ||
      req.body.designation.trim().length < 2 ||
      req.body.designation.trim().length > 100
    ) {
      return next(new AppError("Invalid designation", 400));
    }

    req.body.designation = req.body.designation.trim();
  }

  if (req.body.phone !== undefined) {
    if (
      typeof req.body.phone !== "string" ||
      req.body.phone.trim().length > 20
    ) {
      return next(new AppError("Invalid phone number", 400));
    }

    req.body.phone = req.body.phone.trim();
  }

  if (req.body.joiningDate !== undefined) {
    const date = new Date(req.body.joiningDate);

    if (Number.isNaN(date.getTime())) {
      return next(new AppError("Invalid joining date", 400));
    }

    req.body.joiningDate = date;
  }

  next();
};

const validateEmployeeStatus = (req, res, next) => {
  const { status } = req.body;

  if (!["active", "inactive"].includes(status)) {
    return next(
      new AppError(
        "Status must be either active or inactive",
        400
      )
    );
  }

  next();
};

const validateCreateManager = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return next(
      new AppError("Invalid manager data", 400)
    );
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  // Name
  if (
    normalizedName.length < 2 ||
    normalizedName.length > 100
  ) {
    return next(
      new AppError(
        "Name must be between 2 and 100 characters",
        400
      )
    );
  }

  // Email
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!emailRegex.test(normalizedEmail)) {
    return next(
      new AppError("Invalid email address", 400)
    );
  }

  // Password
  if (
    password.length < 8 ||
    password.length > 128
  ) {
    return next(
      new AppError(
        "Password must be between 8 and 128 characters",
        400
      )
    );
  }

  req.body.name = normalizedName;
  req.body.email = normalizedEmail;

  next();
};

module.exports = {
  validateCreateEmployee,
  validateCreateManager,
  validateUpdateEmployee,
  validateEmployeeStatus,
};