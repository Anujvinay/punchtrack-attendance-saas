const { z } = require("zod");
const AppError = require("../utils/AppError");

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be between 2 and 100 characters")
      .max(100, "Name must be between 2 and 100 characters"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address"),

    password: z
      .string()
      .min(8, "Password must be between 8 and 128 characters")
      .max(128, "Password must be between 8 and 128 characters"),

    employeeId: z
      .string()
      .trim()
      .min(2, "Employee ID must be between 2 and 30 characters")
      .max(30, "Employee ID must be between 2 and 30 characters"),

    department: z
      .string()
      .trim()
      .min(2, "Department must be between 2 and 100 characters")
      .max(100, "Department must be between 2 and 100 characters"),

    designation: z
      .string()
      .trim()
      .min(2, "Designation must be between 2 and 100 characters")
      .max(100, "Designation must be between 2 and 100 characters"),

    phone: z
      .string()
      .trim()
      .max(20, "Phone cannot exceed 20 characters")
      .optional()
      .or(z.literal("")),

    joiningDate: z
      .string()
      .min(1, "Joining date is required"),
  })
  .strict();

const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email or password"),

    password: z
      .string()
      .min(8, "Invalid email or password")
      .max(128, "Invalid email or password"),
  })
  .strict();

const validateWithSchema = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new AppError(
          result.error.issues[0]?.message ||
            "Invalid request data",
          400
        )
      );
    }

    req.body = result.data;
    next();
  };
};

const validateRegister =
  validateWithSchema(registerSchema);

const validateLogin =
  validateWithSchema(loginSchema);

module.exports = {
  validateRegister,
  validateLogin,
};