const AppError = require("../utils/AppError");

const validateCreateOvertimeRequest = (req, res, next) => {
  const { attendanceId, reason } = req.body;

  if (typeof attendanceId !== "string" || !attendanceId.trim()) {
    return next(
      new AppError("Attendance ID is required", 400)
    );
  }

  if (reason !== undefined && reason !== null) {
    if (typeof reason !== "string") {
      return next(
        new AppError("Reason must be a string", 400)
      );
    }

    if (reason.trim().length > 500) {
      return next(
        new AppError(
          "Reason cannot exceed 500 characters",
          400
        )
      );
    }

    req.body.reason = reason.trim();
  }

  req.body.attendanceId = attendanceId.trim();

  next();
};
const validateReviewOvertime = (req, res, next) => {
  const { status, reviewNote } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return next(
      new AppError(
        "Status must be approved or rejected",
        400
      )
    );
  }

  if (reviewNote !== undefined && reviewNote !== null) {
    if (
      typeof reviewNote !== "string" ||
      reviewNote.trim().length > 500
    ) {
      return next(
        new AppError("Invalid review note", 400)
      );
    }

    req.body.reviewNote = reviewNote.trim();
  }

  next();
};

module.exports = {
  validateCreateOvertimeRequest,
    validateReviewOvertime,
};