const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const User = require("../models/User");
const Overtime = require("../models/Overtime");
const AppError = require("../utils/AppError");
const {
  getBusinessDateRange,
} = require("../utils/dateUtils");

// ============================================================
// HELPER: GET REPORT SCOPE (MANAGER ISOLATION)
// ============================================================
const getReportScope = async (currentUser) => {
  if (!currentUser) {
    throw new AppError("Authenticated user is required", 401);
  }

  if (currentUser.role === "admin") {
    return {
      userIds: null,
      employeeIds: null,
    };
  }

  if (currentUser.role !== "manager") {
    throw new AppError(
      "You are not authorized to access reports",
      403
    );
  }

  const teamUsers = await User.find({
    managerId: currentUser._id,
    role: "employee",
    isActive: true,
  })
    .select("_id")
    .lean();

  const userIds = teamUsers.map((user) => user._id);

  if (userIds.length === 0) {
    return {
      userIds: [],
      employeeIds: [],
    };
  }

  const teamEmployees = await Employee.find({
    user: { $in: userIds },
    status: "active",
  })
    .select("_id")
    .lean();

  return {
    userIds,
    employeeIds: teamEmployees.map(
      (employee) => employee._id
    ),
  };
};

// ============================================================
// GET ATTENDANCE REPORT
// ============================================================
const getAttendanceReport = async ({
  from,
  to,
  currentUser,
}) => {
  if (!from || !to) {
    throw new AppError(
      "Both from and to dates are required",
      400
    );
  }

  const {
    startOfDay: fromDate,
    endOfDay: toDate,
  } = getBusinessDateRange(from, to);

  if (
    Number.isNaN(fromDate.getTime()) ||
    Number.isNaN(toDate.getTime())
  ) {
    throw new AppError("Invalid date range", 400);
  }

  if (fromDate > toDate) {
    throw new AppError(
      "From date cannot be after to date",
      400
    );
  }

  const { userIds, employeeIds } =
    await getReportScope(currentUser);

  const employeeFilter = {
    status: "active",
  };

  if (currentUser.role === "manager") {
    employeeFilter._id = {
      $in: employeeIds,
    };
  }

  const attendanceMatch = {
    date: {
      $gte: fromDate,
      $lte: toDate,
    },
  };

  if (currentUser.role === "manager") {
    attendanceMatch.user = {
      $in: userIds,
    };
  }

  const [
    totalEmployees,
    attendanceSummary,
    workingSummary,
  ] = await Promise.all([
    Employee.countDocuments(employeeFilter),

    Attendance.aggregate([
      {
        $match: attendanceMatch,
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]),

    Attendance.aggregate([
      {
        $match: attendanceMatch,
      },
      {
        $group: {
          _id: null,
          totalWorkingMinutes: {
            $sum: "$workingMinutes",
          },
          totalOvertimeMinutes: {
            $sum: "$overtimeMinutes",
          },
        },
      },
    ]),
  ]);

  let present = 0;
  let late = 0;
  let halfDay = 0;

  for (const item of attendanceSummary) {
    if (item._id === "present") {
      present = item.count;
    }

    if (item._id === "late") {
      late = item.count;
    }

    if (item._id === "half-day") {
      halfDay = item.count;
    }
  }

  const totalCalendarDays =
    Math.floor(
      (toDate.getTime() - fromDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const recordedAttendance =
    attendanceSummary.reduce(
      (total, item) => total + item.count,
      0
    );

  const expectedAttendance =
    totalEmployees * totalCalendarDays;

  const absent = Math.max(
    expectedAttendance - recordedAttendance,
    0
  );

  const totals = workingSummary[0] || {
    totalWorkingMinutes: 0,
    totalOvertimeMinutes: 0,
  };

  return {
    dateRange: {
      from: fromDate,
      to: toDate,
    },

    employees: {
      total: totalEmployees,
    },

    attendance: {
      present,
      absent,
      late,
      halfDay,
    },

    working: {
      totalWorkingMinutes:
        totals.totalWorkingMinutes || 0,

      totalOvertimeMinutes:
        totals.totalOvertimeMinutes || 0,
    },
  };
};

// ============================================================
// GET EMPLOYEE ATTENDANCE REPORT
// ============================================================
const getEmployeeAttendanceReport = async ({
  from,
  to,
  employeeId,
  currentUser,
}) => {
  if (!from || !to) {
    throw new AppError(
      "Both from and to dates are required",
      400
    );
  }

  const {
    startOfDay: fromDate,
    endOfDay: toDate,
  } = getBusinessDateRange(from, to);

  if (
    Number.isNaN(fromDate.getTime()) ||
    Number.isNaN(toDate.getTime())
  ) {
    throw new AppError("Invalid date range", 400);
  }

  if (fromDate > toDate) {
    throw new AppError(
      "From date cannot be after to date",
      400
    );
  }

  const { employeeIds } = await getReportScope(currentUser);

  const match = {
    date: {
      $gte: fromDate,
      $lte: toDate,
    },
  };

  if (employeeId) {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new AppError("Invalid employee ID", 400);
    }

    const requestedEmployeeId = new mongoose.Types.ObjectId(employeeId);

    if (
      currentUser.role === "manager" &&
      !employeeIds.some((id) =>
        id.equals(requestedEmployeeId)
      )
    ) {
      throw new AppError(
        "You are not authorized to access this employee report",
        403
      );
    }

    match.employee = requestedEmployeeId;
  } else if (currentUser.role === "manager") {
    match.employee = {
      $in: employeeIds,
    };
  }

  const report = await Attendance.aggregate([
    {
      $match: match,
    },
    {
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employee",
      },
    },
    {
      $unwind: "$employee",
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $group: {
        _id: "$employee._id",

        employeeId: {
          $first: "$employee.employeeId",
        },

        name: {
          $first: "$user.name",
        },

        email: {
          $first: "$user.email",
        },

        department: {
          $first: "$employee.department",
        },

        present: {
          $sum: {
            $cond: [
              { $eq: ["$status", "present"] },
              1,
              0,
            ],
          },
        },

        late: {
          $sum: {
            $cond: [
              { $eq: ["$status", "late"] },
              1,
              0,
            ],
          },
        },

        absent: {
          $sum: {
            $cond: [
              { $eq: ["$status", "absent"] },
              1,
              0,
            ],
          },
        },

        halfDay: {
          $sum: {
            $cond: [
              { $eq: ["$status", "half-day"] },
              1,
              0,
            ],
          },
        },

        totalWorkingMinutes: {
          $sum: "$workingMinutes",
        },

        totalOvertimeMinutes: {
          $sum: "$overtimeMinutes",
        },
      },
    },
    {
      $sort: {
        name: 1,
      },
    },
  ]);

  return {
    dateRange: {
      from: fromDate,
      to: toDate,
    },
    employees: report,
  };
};

// ============================================================
// GET MONTHLY REPORT
// ============================================================
const getMonthlyReport = async ({
  year,
  month,
  currentUser,
}) => {
  const numericYear = Number(year);
  const numericMonth = Number(month);

  if (
    !Number.isInteger(numericYear) ||
    !Number.isInteger(numericMonth) ||
    numericMonth < 1 ||
    numericMonth > 12
  ) {
    throw new AppError(
      "Valid year and month are required",
      400
    );
  }

  const startDateObj = new Date(
    numericYear,
    numericMonth - 1,
    1
  );

  const endDateObj = new Date(
    numericYear,
    numericMonth,
    0
  );

  const startDate = getBusinessDateRange(startDateObj, startDateObj).startOfDay;
  const endDate = getBusinessDateRange(endDateObj, endDateObj).endOfDay;

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw new AppError("Invalid report date range", 400);
  }

  const { employeeIds, userIds } =
    await getReportScope(currentUser);

  const employeeFilter = {
    status: "active",
  };

  if (currentUser.role === "manager") {
    employeeFilter._id = {
      $in: employeeIds,
    };
  }

  const attendanceMatch = {
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  if (currentUser.role === "manager") {
    attendanceMatch.user = {
      $in: userIds,
    };
  }

  const [
    totalEmployees,
    attendanceSummary,
  ] = await Promise.all([
    Employee.countDocuments(employeeFilter),

    Attendance.aggregate([
      {
        $match: attendanceMatch,
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
          workingMinutes: {
            $sum: "$workingMinutes",
          },
        },
      },
    ]),
  ]);

  let present = 0;
  let late = 0;
  let halfDay = 0;
  let explicitAbsent = 0;
  let totalWorkingMinutes = 0;

  for (const item of attendanceSummary) {
    totalWorkingMinutes += item.workingMinutes || 0;

    if (item._id === "present") {
      present = item.count;
    }

    if (item._id === "late") {
      late = item.count;
    }

    if (item._id === "half-day") {
      halfDay = item.count;
    }

    if (item._id === "absent") {
      explicitAbsent = item.count;
    }
  }

  const totalCalendarDays =
    Math.floor(
      (endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const expectedAttendance =
    totalEmployees * totalCalendarDays;

  const recordedAttendance =
    attendanceSummary.reduce(
      (total, item) => total + item.count,
      0
    );

  const missingAttendance = Math.max(
    expectedAttendance - recordedAttendance,
    0
  );

  const absent = explicitAbsent + missingAttendance;

  return {
    year: numericYear,
    month: numericMonth,

    summary: {
      present,
      absent,
      late,
      halfDay,
      totalWorkingMinutes,
    },
  };
};

// ============================================================
// GET OVERTIME REPORT
// ============================================================
const getOvertimeReport = async ({ from, to, status, currentUser }) => {
  if (!from || !to) {
    throw new AppError(
      "Both from and to dates are required",
      400
    );
  }

  const {
    startOfDay: fromDate,
    endOfDay: toDate,
  } = getBusinessDateRange(from, to);

  if (
    Number.isNaN(fromDate.getTime()) ||
    Number.isNaN(toDate.getTime())
  ) {
    throw new AppError("Invalid date range", 400);
  }

  if (fromDate > toDate) {
    throw new AppError(
      "From date cannot be after to date",
      400
    );
  }

  const filter = {
    date: {
      $gte: fromDate,
      $lte: toDate,
    },
  };

  if (currentUser.role === "manager") {
    const { userIds } = await getReportScope(currentUser);
    filter.user = {
      $in: userIds,
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

  const report = await Overtime.aggregate([
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employee",
      },
    },
    {
      $unwind: "$employee",
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $group: {
        _id: "$employee._id",

        employeeId: {
          $first: "$employee.employeeId",
        },

        name: {
          $first: "$user.name",
        },

        email: {
          $first: "$user.email",
        },

        department: {
          $first: "$employee.department",
        },

        totalRequests: {
          $sum: 1,
        },

        totalMinutes: {
          $sum: "$minutes",
        },

        approvedMinutes: {
          $sum: {
            $cond: [
              { $eq: ["$status", "approved"] },
              "$minutes",
              0,
            ],
          },
        },

        pendingMinutes: {
          $sum: {
            $cond: [
              { $eq: ["$status", "pending"] },
              "$minutes",
              0,
            ],
          },
        },

        rejectedMinutes: {
          $sum: {
            $cond: [
              { $eq: ["$status", "rejected"] },
              "$minutes",
              0,
            ],
          },
        },
      },
    },
    {
      $sort: {
        name: 1,
      },
    },
  ]);

  return {
    dateRange: {
      from: fromDate,
      to: toDate,
    },
    employees: report,
  };
};

// ============================================================
// GET DAILY ATTENDANCE REPORT
// ============================================================
const getDailyAttendanceReport = async ({
  from,
  to,
  currentUser,
}) => {
  if (!from || !to) {
    throw new AppError(
      "Both from and to dates are required",
      400
    );
  }

  const {
    startOfDay: fromDate,
    endOfDay: toDate,
  } = getBusinessDateRange(from, to);

  if (
    Number.isNaN(fromDate.getTime()) ||
    Number.isNaN(toDate.getTime())
  ) {
    throw new AppError("Invalid date range", 400);
  }

  if (fromDate > toDate) {
    throw new AppError(
      "From date cannot be after to date",
      400
    );
  }

  const { userIds, employeeIds } =
    await getReportScope(currentUser);

  const match = {
    date: {
      $gte: fromDate,
      $lte: toDate,
    },
  };

  // Manager → only own team attendance
  if (currentUser.role === "manager") {
    match.user = {
      $in: userIds,
    };
  }

  // Admin → all attendance
  // Manager → already restricted above

  const report = await Attendance.aggregate([
    {
      $match: match,
    },

    // Employee information
    {
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employee",
      },
    },

    {
      $unwind: "$employee",
    },

    // User information
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },

    {
      $unwind: "$user",
    },

    {
      $sort: {
        date: -1,
        "user.name": 1,
      },
    },

    {
      $project: {
        _id: 1,

        date: 1,

        employee: {
          _id: "$employee._id",
          employeeId: "$employee.employeeId",
          department: "$employee.department",
          designation: "$employee.designation",
        },

        user: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
        },

        checkIn: 1,
        checkOut: 1,

        checkInSelfie: 1,
        checkOutSelfie: 1,

        checkInLocation: 1,
        checkOutLocation: 1,

        workingMinutes: 1,
        overtimeMinutes: 1,

        status: 1,

        verificationStatus: 1,
        verificationNote: 1,

        verifiedBy: 1,
        verifiedAt: 1,
      },
    },
  ]);

  return {
    dateRange: {
      from: fromDate,
      to: toDate,
    },
    records: report,
  };
};



module.exports = {
  getAttendanceReport,
  getDailyAttendanceReport,
  getEmployeeAttendanceReport,
  getMonthlyReport,
  getOvertimeReport,
};