const AppError = require("../utils/AppError");

const validateRequiredFields = (body, fields) => {
  const missingFields = fields.filter((field) => {
    const value = body[field];

    return (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    );
  });

  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      400
    );
  }
};

module.exports = {
  validateRequiredFields,
};