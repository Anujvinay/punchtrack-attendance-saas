const reportService = require("../services/reportService");

const getAttendanceReport = async (req, res, next) => {
  try {
    const result = await reportService.getAttendanceReport({
      from: req.query.from,
      to: req.query.to,
      currentUser: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Attendance report fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getDailyAttendanceReport = async (req, res, next) => {
  try {
    const result =
      await reportService.getDailyAttendanceReport({
        from: req.query.from,
        to: req.query.to,
        currentUser: req.user,
      });

    return res.status(200).json({
      success: true,
      message: "Daily attendance report fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeAttendanceReport = async (req, res, next) => {
  try {
    const result = await reportService.getEmployeeAttendanceReport({
      from: req.query.from,
      to: req.query.to,
      employeeId: req.query.employeeId,
      currentUser: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Employee attendance report fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const result = await reportService.getMonthlyReport({
      year: req.query.year,
      month: req.query.month,
      currentUser: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Monthly report fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOvertimeReport = async (req, res, next) => {
  try {
    const result = await reportService.getOvertimeReport({
      from: req.query.from,
      to: req.query.to,
      status: req.query.status,
      currentUser: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Overtime report fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendanceReport,
  getDailyAttendanceReport,
  getEmployeeAttendanceReport,
  getMonthlyReport,
  getOvertimeReport,
};