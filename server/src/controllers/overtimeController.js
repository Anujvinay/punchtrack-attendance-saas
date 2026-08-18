const overtimeService = require("../services/overtimeService");

const createOvertimeRequest = async (req, res, next) => {
  try {
    const overtime = await overtimeService.createOvertimeRequest({
      userId: req.user._id,
      attendanceId: req.body.attendanceId,
      reason: req.body.reason,
    });

    return res.status(201).json({
      success: true,
      message: "Overtime request created successfully",
      data: {
        overtime,
      },
    });
  } catch (error) {
    next(error);
  }
};

const reviewOvertime = async (req, res, next) => {
  try {
    const overtime = await overtimeService.reviewOvertime({
      overtimeId: req.params.id,
      reviewerId: req.user._id,
      currentUser: req.user, // ✅ Passed currentUser
      status: req.body.status,
      reviewNote: req.body.reviewNote,
    });

    return res.status(200).json({
      success: true,
      message: "Overtime request reviewed successfully",
      data: {
        overtime,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllOvertime = async (req, res, next) => {
  try {
    const result = await overtimeService.getAllOvertime({
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      date: req.query.date,
      currentUser: req.user, // ✅ Passed currentUser
    });

    return res.status(200).json({
      success: true,
      message: "Overtime requests fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOvertime = async (req, res, next) => {
  try {
    const result = await overtimeService.getMyOvertime({
      userId: req.user._id,
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    });

    return res.status(200).json({
      success: true,
      message: "My overtime requests fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOvertimeRequest,
  reviewOvertime,
  getAllOvertime,
  getMyOvertime,
};