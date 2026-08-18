const express = require("express");

const {
  getAttendanceReport,
  getDailyAttendanceReport,
  getEmployeeAttendanceReport,
  getMonthlyReport,
  getOvertimeReport,
} = require("../controllers/reportController");

const {
  authMiddleware,
} = require("../middleware/authMiddleware");

const {
  requireRoles,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin / Manager - attendance report
router.get(
  "/attendance",
  authMiddleware,
  requireRoles("admin", "manager"),
  getAttendanceReport
);

router.get(
  "/attendance/daily",
  authMiddleware,
  requireRoles("admin", "manager"),
  getDailyAttendanceReport
);

router.get(
  "/attendance/employees",
  authMiddleware,
  requireRoles("admin", "manager"),
  getEmployeeAttendanceReport
);

router.get(
  "/attendance/monthly",
  authMiddleware,
  requireRoles("admin", "manager"),
  getMonthlyReport
);

router.get(
  "/overtime",
  authMiddleware,
  requireRoles("admin", "manager"),
  getOvertimeReport
);

module.exports = router;