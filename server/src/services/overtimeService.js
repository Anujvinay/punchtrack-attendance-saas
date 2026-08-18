const mongoose = require("mongoose");

const Overtime = require("../models/Overtime");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const {
  getBusinessDayRange,
} = require("../utils/dateUtils");

const createOvertimeRequest = async ({
  userId,
  attendanceId,
  reason = "",
}) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
    throw new AppError("Invalid attendance ID", 400);
  }

  const employee = await Employee.findOne({
    user: userId,
  });

  if (!employee) {
    throw new AppError(
      "Employee profile not found",
      404
    );
  }

  if (employee.status !== "active") {
    throw new AppError(
      "Your employee account is inactive",
      403
    );
  }

  const attendance = await Attendance.findOne({
    _id: attendanceId,
    employee: employee._id,
    user: userId,
  });

  if (!attendance) {
    throw new AppError(
      "Attendance record not found",
      404
    );
  }

  if (!attendance.checkOut) {
    throw new AppError(
      "Please check out before requesting overtime",
      400
    );
  }

  const standardMinutes = 8 * 60;

  const overtimeMinutes = Math.max(
    attendance.workingMinutes - standardMinutes,
    0
  );

  if (overtimeMinutes <= 0) {
    throw new AppError(
      "No overtime is available for this attendance",
      400
    );
  }

  let overtime;
  try {
    overtime = await Overtime.create({
      employee: employee._id,
      user: userId,
      attendance: attendance._id,
      date: attendance.date,
      minutes: overtimeMinutes,
      reason: reason.trim(),
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError(
        "Overtime request already exists for this attendance",
        409
      );
    }

    throw error;
  }

  return Overtime.findById(overtime._id)
    .populate({
      path: "employee",
      select: "employeeId department designation status",
    })
    .populate({
      path: "user",
      select: "name email role isActive",
    })
    .populate({
      path: "attendance",
      select:
        "date checkIn checkOut workingMinutes status",
    })
    .lean();
};

const reviewOvertime = async ({
  overtimeId,
  reviewerId,
  currentUser,
  status,
  reviewNote = "",
}) => {
  if (!mongoose.Types.ObjectId.isValid(overtimeId)) {
    throw new AppError("Invalid overtime ID", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(reviewerId)) {
    throw new AppError("Invalid reviewer ID", 400);
  }

  if (!["approved", "rejected"].includes(status)) {
    throw new AppError(
      "Status must be approved or rejected",
      400
    );
  }

  if (
    typeof reviewNote !== "string" ||
    reviewNote.length > 500
  ) {
    throw new AppError("Review note is invalid", 400);
  }

  const overtimeDoc = await Overtime.findById(overtimeId)
    .populate({
      path: "user",
      select: "name email role isActive managerId",
    });

  if (!overtimeDoc) {
    throw new AppError(
      "Overtime request not found",
      404
    );
  }

  if (currentUser.role === "manager") {
    if (
      overtimeDoc.user?.managerId?.toString() !==
      currentUser._id.toString()
    ) {
      throw new AppError(
        "You are not authorized to review this overtime request",
        403
      );
    }
  }

  const updatedOvertime =
    await Overtime.findOneAndUpdate(
      {
        _id: overtimeId,
        status: "pending",
      },
      {
        $set: {
          status,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          reviewNote: reviewNote.trim(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

  if (!updatedOvertime) {
    const existingOvertime =
      await Overtime.findById(overtimeId)
        .select("status")
        .lean();

    if (!existingOvertime) {
      throw new AppError(
        "Overtime request not found",
        404
      );
    }

    throw new AppError(
      "Overtime request has already been reviewed",
      409
    );
  }

  return Overtime.findById(updatedOvertime._id)
    .populate({
      path: "employee",
      select:
        "employeeId department designation status",
    })
    .populate({
      path: "user",
      select:
        "name email role isActive managerId",
    })
    .populate({
      path: "attendance",
      select:
        "date checkIn checkOut workingMinutes",
    })
    .populate({
      path: "reviewedBy",
      select: "name email role",
    })
    .lean();
};

const getAllOvertime = async ({
  page = 1,
  limit = 10,
  status,
  date,
  currentUser,
}) => {
  const currentPage = Math.max(Number(page) || 1, 1);

  const perPage = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const skip = (currentPage - 1) * perPage;

  const filter = {};

  if (currentUser.role === "manager") {
    const teamUsers = await User.find({
      managerId: currentUser._id,
      role: "employee",
    })
      .select("_id")
      .lean();

    const teamUserIds = teamUsers.map((user) => user._id);

    filter.user = {
      $in: teamUserIds,
    };
  }

  if (status) {
    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      throw new AppError(
        "Invalid overtime status",
        400
      );
    }

    filter.status = status;
  }

  if (date) {
    const selectedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      throw new AppError("Invalid date", 400);
    }

    const {
      startOfDay,
      endOfDay,
    } = getBusinessDayRange(selectedDate);

    filter.date = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  const [overtime, total] = await Promise.all([
    Overtime.find(filter)
      .populate({
        path: "employee",
        select: "employeeId department designation status",
      })
      .populate({
        path: "user",
        select: "name email role isActive managerId",
      })
      .populate({
        path: "attendance",
        select:
          "date checkIn checkOut workingMinutes status",
      })
      .populate({
        path: "reviewedBy",
        select: "name email role",
      })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),

    Overtime.countDocuments(filter),
  ]);

  return {
    overtime,
    pagination: {
      page: currentPage,
      limit: perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

const getMyOvertime = async ({
  userId,
  page = 1,
  limit = 10,
  status,
}) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  const employee = await Employee.findOne({
    user: userId,
  });

  if (!employee) {
    throw new AppError("Employee profile not found", 404);
  }

  const currentPage = Math.max(Number(page) || 1, 1);

  const perPage = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const skip = (currentPage - 1) * perPage;

  const filter = {
    employee: employee._id,
    user: userId,
  };

  if (status) {
    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      throw new AppError("Invalid overtime status", 400);
    }

    filter.status = status;
  }

  const [overtime, total] = await Promise.all([
    Overtime.find(filter)
      .populate({
        path: "attendance",
        select:
          "date checkIn checkOut workingMinutes status",
      })
      .populate({
        path: "reviewedBy",
        select: "name email role",
      })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),

    Overtime.countDocuments(filter),
  ]);

  return {
    overtime,
    pagination: {
      page: currentPage,
      limit: perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

module.exports = {
  createOvertimeRequest,
  reviewOvertime,
  getAllOvertime,
  getMyOvertime,
};