const express = require("express");

const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  verifyAttendance,
} = require("../controllers/attendanceController");

const {
  authMiddleware,
} = require("../middleware/authMiddleware");

const {
  requireRoles,
} = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// ============================================================
// ADMIN / MANAGER
// ============================================================

router.get(
  "/",
  authMiddleware,
  requireRoles("admin", "manager"),
  getAllAttendance
);

router.patch(
  "/:id/verify",
  authMiddleware,
  requireRoles("admin", "manager"),
  verifyAttendance
);

// ============================================================
// EMPLOYEE CHECK IN
// ============================================================

router.post(
  "/check-in",
  authMiddleware,
  upload.single("selfie"),
  checkIn
);

// ============================================================
// EMPLOYEE CHECK OUT
// ============================================================

router.post(
  "/check-out",
  authMiddleware,
  upload.single("selfie"),
  checkOut
);

// ============================================================
// EMPLOYEE OWN ATTENDANCE
// ============================================================

router.get(
  "/my",
  authMiddleware,
  getMyAttendance
);

module.exports = router;