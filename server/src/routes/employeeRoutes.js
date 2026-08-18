const express = require("express");

const {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  updateEmployeeStatus,
  assignManager,
  getManagers,
  createManager,
} = require("../controllers/employeeController");

const {
  authMiddleware,
} = require("../middleware/authMiddleware");

const {
  requireRoles,
} = require("../middleware/roleMiddleware");

const {
  validateCreateManager,
  validateUpdateEmployee,
  validateEmployeeStatus,
} = require("../validators/employeeValidator");

const router = express.Router();

/**
 * Get all employees (with pagination, search, and filters)
 * 
 * Authentication → Authorization → Controller
 */
router.get(
  "/",
  authMiddleware,
  requireRoles("admin", "manager"),
  getEmployees
);

/**
 * Get active managers
 * 
 * Authentication → Authorization (Admin only) → Controller
 */
router.get(
  "/managers",
  authMiddleware,
  requireRoles("admin"),
  getManagers
);

/**
 * Create manager
 *
 * Authentication → Authorization (Admin only) → Validation → Controller
 */
router.post(
  "/managers",
  authMiddleware,
  requireRoles("admin"),
  validateCreateManager,
  createManager
);

/**
 * Get employee by ID
 *
 * Authentication → Authorization → Controller
 */
router.get(
  "/:id",
  authMiddleware,
  requireRoles("admin", "manager"),
  getEmployeeById
);

/**
 * Update employee details
 *
 * Authentication → Authorization → Validation → Controller
 */
router.patch(
  "/:id",
  authMiddleware,
  requireRoles("admin", "manager"),
  validateUpdateEmployee,
  updateEmployee
);

/**
 * Update employee status (Active/Inactive)
 *
 * Authentication → Authorization → Validation → Controller
 */
router.patch(
  "/:id/status",
  authMiddleware,
  requireRoles("admin", "manager"),
  validateEmployeeStatus,
  updateEmployeeStatus
);

/**
 * Assign / change manager for an employee
 *
 * Authentication → Authorization (Admin only) → Controller
 */
router.patch(
  "/:id/manager",
  authMiddleware,
  requireRoles("admin"),
  assignManager
);

module.exports = router;