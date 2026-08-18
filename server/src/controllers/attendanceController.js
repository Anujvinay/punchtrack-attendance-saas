const attendanceService = require("../services/attendanceService");

// ============================================================
// CHECK IN
// ============================================================

const checkIn = async (req, res, next) => {
  try {
    // Selfie middleware se req.file aayegi
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Selfie is required for check-in",
      });
    }

    const attendance = await attendanceService.checkIn({
      userId: req.user._id,
      selfieBuffer: req.file.buffer,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: {
        attendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// CHECK OUT
// ============================================================

const checkOut = async (req, res, next) => {
  try {
    // Selfie required
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Selfie is required for check-out",
      });
    }

    const attendance = await attendanceService.checkOut({
      userId: req.user._id,
      selfieBuffer: req.file.buffer,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });

    return res.status(200).json({
      success: true,
      message: "Attendance checked out successfully",
      data: {
        attendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET MY ATTENDANCE
// ============================================================

const getMyAttendance = async (req, res, next) => {
  try {
    const result = await attendanceService.getMyAttendance({
      userId: req.user._id,
      page: req.query.page,
      limit: req.query.limit,
    });

    return res.status(200).json({
      success: true,
      message: "Attendance history fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL ATTENDANCE
// ============================================================

const getAllAttendance = async (req, res, next) => {
  try {
    const result = await attendanceService.getAllAttendance({
      page: req.query.page,
      limit: req.query.limit,
      date: req.query.date,
      status: req.query.status,
      currentUser: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Attendance fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// VERIFY ATTENDANCE
// ============================================================

const verifyAttendance = async (req, res, next) => {
  try {
    const attendance = await attendanceService.verifyAttendance({
      attendanceId: req.params.id,
      verifierId: req.user._id,
      currentUser: req.user,
      verificationStatus: req.body.verificationStatus,
      verificationNote: req.body.verificationNote,
    });

    return res.status(200).json({
      success: true,
      message: "Attendance verification updated successfully",
      data: {
        attendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  verifyAttendance,
};