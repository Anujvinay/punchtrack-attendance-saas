const express = require("express");

const {
  createOvertimeRequest,
  reviewOvertime,
  getAllOvertime,
  getMyOvertime,
} = require("../controllers/overtimeController");

const {
  authMiddleware,
} = require("../middleware/authMiddleware");

const {
  requireRoles,
} = require("../middleware/roleMiddleware");

const {
  validateCreateOvertimeRequest,
  validateReviewOvertime,
} = require("../validators/overtimeValidator");

const router = express.Router();

/**
 * Admin/Manager - Get all overtime requests (with filters and pagination)
 *
 * Authentication → Authorization → Controller
 */
router.get(
  "/",
  authMiddleware,
  requireRoles("admin", "manager"),
  getAllOvertime
);

/**
 * Employee - Create overtime request
 * 
 * Authentication → Authorization → Validation → Controller
 */
router.post(
  "/",
  authMiddleware,
  requireRoles("employee"),
  validateCreateOvertimeRequest,
  createOvertimeRequest
);

/**
 * Employee - Get my overtime requests
 * 
 * Authentication → Authorization → Controller
 */
router.get(
  "/my",
  authMiddleware,
  requireRoles("employee"),
  getMyOvertime
);

/**
 * Admin/Manager - Review (Approve/Reject) overtime request
 * 
 * Authentication → Authorization → Validation → Controller
 */
router.patch(
  "/:id/review",
  authMiddleware,
  requireRoles("admin", "manager"),
  validateReviewOvertime,
  reviewOvertime
);

module.exports = router;