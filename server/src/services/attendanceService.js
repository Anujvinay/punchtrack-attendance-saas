const mongoose = require("mongoose");

const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const {
  getBusinessDayRange,
} = require("../utils/dateUtils");

// ============================================================
// HELPERS
// ============================================================

const validateCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new AppError("Invalid latitude", 400);
  }

  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new AppError("Invalid longitude", 400);
  }

  return {
    type: "Point",
    coordinates: [lng, lat],
  };
};

const getTodayRange = () => {
  return getBusinessDayRange(new Date());
};

const getEmployeeByUserId = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  const employee = await Employee.findOne({
    user: userId,
  });

  if (!employee) {
    throw new AppError("Employee profile not found", 404);
  }

  if (employee.status !== "active") {
    throw new AppError("Your employee account is inactive", 403);
  }

  return employee;
};

// ============================================================
// CHECK IN
// ============================================================

const checkIn = async ({
  userId,
  selfieBuffer,
  latitude,
  longitude,
}) => {
  const employee = await getEmployeeByUserId(userId);

  // Selfie required
  if (!selfieBuffer) {
    throw new AppError("Selfie is required for check-in", 400);
  }

  // Validate GPS coordinates
  const location = validateCoordinates(latitude, longitude);

  const { startOfDay, endOfDay } = getTodayRange();

  // Check existing attendance
  const existingAttendance = await Attendance.findOne({
    employee: employee._id,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (existingAttendance) {
    throw new AppError("Attendance already marked for today", 409);
  }

  // Server timestamp
  const now = new Date();

  // ==========================================================
  // CLOUDINARY UPLOAD
  // ==========================================================

  let uploadedSelfie = null;

  try {
    uploadedSelfie = await uploadToCloudinary(
      selfieBuffer,
      "attendance/selfies/check-in"
    );
  } catch (error) {
    console.error("Check-in selfie upload failed:", error);
    throw new AppError("Unable to upload check-in selfie", 500);
  }

  try {
    const attendance = await Attendance.create({
      employee: employee._id,
      user: userId,
      date: startOfDay,
      checkIn: now,
      checkInSelfie: uploadedSelfie.secure_url,
      checkInLocation: location,
      status: "present",
      verificationStatus: "pending",
    });

    return attendance;
  } catch (error) {
    // ========================================================
    // DUPLICATE ATTENDANCE
    // ========================================================
    if (error?.code === 11000) {
      throw new AppError("Attendance already marked for today", 409);
    }

    // ========================================================
    // CLEANUP CLOUDINARY FILE IF DB SAVE FAILS
    // ========================================================
    if (uploadedSelfie?.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadedSelfie.public_id);
      } catch (cleanupError) {
        console.error("Failed to cleanup Cloudinary selfie:", cleanupError);
      }
    }

    throw error;
  }
};

// ============================================================
// CHECK OUT
// ============================================================

const checkOut = async ({
  userId,
  selfieBuffer,
  latitude,
  longitude,
}) => {
  const employee = await getEmployeeByUserId(userId);

  if (!selfieBuffer) {
    throw new AppError(
      "Selfie is required for check-out",
      400
    );
  }

  const location = validateCoordinates(
    latitude,
    longitude
  );

  const { startOfDay, endOfDay } = getTodayRange();

  const attendance = await Attendance.findOne({
    employee: employee._id,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  if (!attendance) {
    throw new AppError(
      "Please check in before checking out",
      400
    );
  }

  if (!attendance.checkIn) {
    throw new AppError(
      "Check-in record not found",
      400
    );
  }

  if (attendance.checkOut) {
    throw new AppError(
      "Attendance already checked out",
      409
    );
  }

  const now = new Date();

  const workingMinutes = Math.max(
    0,
    Math.floor(
      (now.getTime() - attendance.checkIn.getTime()) /
        60000
    )
  );

  const STANDARD_SHIFT_MINUTES = 8 * 60;

  const overtimeMinutes = Math.max(
    0,
    workingMinutes - STANDARD_SHIFT_MINUTES
  );

  const status =
    workingMinutes >= STANDARD_SHIFT_MINUTES
      ? "present"
      : "half-day";

  let uploadedSelfie = null;

  try {
    uploadedSelfie = await uploadToCloudinary(
      selfieBuffer,
      "attendance/selfies/check-out"
    );
  } catch (error) {
    console.error(
      "Check-out selfie upload failed:",
      error
    );

    throw new AppError(
      "Unable to upload check-out selfie",
      500
    );
  }

  try {
    const updatedAttendance =
      await Attendance.findOneAndUpdate(
        {
          _id: attendance._id,

          // Atomic protection against
          // concurrent checkout requests.
          checkOut: null,
        },
        {
          $set: {
            checkOut: now,
            checkOutSelfie:
              uploadedSelfie.secure_url,
            checkOutLocation: location,
            workingMinutes,
            overtimeMinutes,
            status,
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!updatedAttendance) {
      // Another request checked out first.
      throw new AppError(
        "Attendance already checked out",
        409
      );
    }

    return updatedAttendance;
  } catch (error) {
    if (uploadedSelfie?.public_id) {
      try {
        await cloudinary.uploader.destroy(
          uploadedSelfie.public_id
        );
      } catch (cleanupError) {
        console.error(
          "Failed to cleanup Cloudinary selfie:",
          cleanupError
        );
      }
    }

    throw error;
  }
};

// ============================================================
// GET MY ATTENDANCE
// ============================================================

const getMyAttendance = async ({
  userId,
  page = 1,
  limit = 10,
}) => {
  const employee = await getEmployeeByUserId(userId);

  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (currentPage - 1) * perPage;

  const [attendance, total] = await Promise.all([
    Attendance.find({
      employee: employee._id,
    })
      .sort({
        date: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(perPage)
      .lean(),

    Attendance.countDocuments({
      employee: employee._id,
    }),
  ]);

  return {
    attendance,
    pagination: {
      page: currentPage,
      limit: perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

// ============================================================
// GET ALL ATTENDANCE
// ============================================================

const getAllAttendance = async ({
  page = 1,
  limit = 10,
  date,
  status,
  currentUser,
}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const perPage = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (currentPage - 1) * perPage;

  const filter = {};

  // ==========================================================
  // TEAM FILTER FOR MANAGER
  // ==========================================================

  if (currentUser && currentUser.role === "manager") {
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

  // ==========================================================
  // DATE FILTER
  // ==========================================================

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

  // ==========================================================
  // STATUS FILTER
  // ==========================================================

  if (status) {
    const allowedStatuses = [
      "present",
      "late",
      "absent",
      "half-day",
    ];

    if (!allowedStatuses.includes(status)) {
      throw new AppError("Invalid attendance status", 400);
    }

    filter.status = status;
  }

  const [attendance, total] = await Promise.all([
    Attendance.find(filter)
      .populate({
        path: "employee",
        select: "employeeId department designation status",
      })
      .populate({
        path: "user",
        select: "name email role isActive managerId",
      })
      .populate({
        path: "verifiedBy",
        select: "name email role",
      })
      .sort({
        date: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(perPage)
      .lean(),

    Attendance.countDocuments(filter),
  ]);

  return {
    attendance,
    pagination: {
      page: currentPage,
      limit: perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

// ============================================================
// VERIFY ATTENDANCE
// ============================================================

const verifyAttendance = async ({
  attendanceId,
  verifierId,
  currentUser,
  verificationStatus,
  verificationNote = "",
}) => {
  if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
    throw new AppError("Invalid attendance ID", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(verifierId)) {
    throw new AppError("Invalid verifier ID", 400);
  }

  const allowedStatuses = ["approved", "rejected"];

  if (!allowedStatuses.includes(verificationStatus)) {
    throw new AppError(
      "Verification status must be approved or rejected",
      400
    );
  }

  if (
    typeof verificationNote !== "string" ||
    verificationNote.length > 500
  ) {
    throw new AppError("Verification note is invalid", 400);
  }

  const attendance = await Attendance.findById(attendanceId)
    .populate({
      path: "employee",
      select: "user employeeId department designation status",
      populate: {
        path: "user",
        select: "managerId role isActive",
      },
    });

  if (!attendance) {
    throw new AppError("Attendance record not found", 404);
  }

  // Manager can verify only attendance belonging to their own team.
  if (currentUser.role === "manager") {
    const employeeUser = attendance.employee?.user;

    if (!employeeUser) {
      throw new AppError(
        "Employee account information not found",
        404
      );
    }

    if (
      employeeUser.managerId?.toString() !==
      currentUser._id.toString()
    ) {
      throw new AppError(
        "You are not authorized to verify this attendance",
        403
      );
    }
  }

  // Prevent verification from being changed once finalized.
  if (
    attendance.verificationStatus === "approved" ||
    attendance.verificationStatus === "rejected"
  ) {
    throw new AppError(
      "Attendance has already been verified",
      409
    );
  }

  attendance.verificationStatus = verificationStatus;
  attendance.verifiedBy = verifierId;
  attendance.verifiedAt = new Date();
  attendance.verificationNote = verificationNote.trim();

  await attendance.save();

  return Attendance.findById(attendance._id)
    .populate({
      path: "employee",
      select: "employeeId department designation status",
    })
    .populate({
      path: "user",
      select: "name email role isActive",
    })
    .populate({
      path: "verifiedBy",
      select: "name email role",
    })
    .lean();
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  verifyAttendance,
};