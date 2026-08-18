const mongoose = require("mongoose"); 
 
const Employee = require("../models/Employee"); 
const User = require("../models/User"); 
const AppError = require("../utils/AppError"); 
 
/** 
 * Create Employee 
 */ 
const createEmployee = async (data, currentUser) => { 
  const { 
    firstName, 
    lastName, 
    email, 
    password, 
    role, 
    managerId, 
    employeeId, 
    department, 
    designation, 
    phone, 
    joiningDate, 
  } = data; 
 
  const session = await mongoose.startSession(); 
 
  try { 
    await session.startTransaction(); 
 
    const normalizedEmail = email.trim().toLowerCase(); 
    const normalizedRole = role.trim().toLowerCase(); 
 
    const allowedRoles = ["employee", "manager"]; 
    if (!allowedRoles.includes(normalizedRole)) { 
      throw new AppError( 
        "Role must be either employee or manager", 
        400 
      ); 
    } 
 
    if (normalizedRole === "manager" && managerId) { 
      throw new AppError( 
        "A manager cannot be assigned to another manager", 
        400 
      ); 
    } 
 
    if (normalizedRole === "employee") { 
      if (!managerId) { 
        throw new AppError( 
          "Manager is required for an employee", 
          400 
        ); 
      } 
 
      if (!mongoose.Types.ObjectId.isValid(managerId)) { 
        throw new AppError( 
          "Invalid manager ID", 
          400 
        ); 
      } 
 
      const manager = await User.findOne({ 
        _id: managerId, 
        role: "manager", 
        isActive: true, 
      }).session(session); 
 
      if (!manager) { 
        throw new AppError( 
          "Selected manager not found or inactive", 
          400 
        ); 
      } 
 
      if (currentUser.role !== "admin") { 
        throw new AppError( 
          "Only admin can assign employees to a manager", 
          403 
        ); 
      } 
    } 
 
    const normalizedEmployeeId = employeeId.trim().toUpperCase(); 
    const normalizedDepartment = department.trim(); 
    const normalizedDesignation = designation.trim(); 
    const normalizedName = `${firstName.trim()} ${lastName.trim()}`.trim(); 
 
    const existingUser = await User.findOne({ 
      email: normalizedEmail, 
    }).session(session); 
 
    if (existingUser) { 
      throw new AppError("An account with this email already exists", 409); 
    } 
 
    const existingEmployee = await Employee.findOne({ 
      employeeId: normalizedEmployeeId, 
    }).session(session); 
 
    if (existingEmployee) { 
      throw new AppError("Employee ID already exists", 409); 
    } 
 
    const user = new User({ 
      name: normalizedName, 
      email: normalizedEmail, 
      password, 
      role: normalizedRole, 
      managerId: normalizedRole === "employee" ? managerId : null, 
      isActive: true, 
    }); 
 
    await user.save({ session }); 
 
    const employee = new Employee({ 
      user: user._id, 
      employeeId: normalizedEmployeeId, 
      department: normalizedDepartment, 
      designation: normalizedDesignation, 
      phone: phone ? phone.trim() : undefined, 
      joiningDate, 
      status: "active", 
    }); 
 
    await employee.save({ session }); 
 
    await session.commitTransaction(); 
 
    const createdEmployee = await Employee.findById(employee._id) 
      .populate({ 
        path: "user", 
        select: "_id name email role isActive createdAt managerId", 
      }) 
      .lean(); 
 
    return createdEmployee; 
  } catch (error) { 
    if (session.inTransaction()) { 
      await session.abortTransaction(); 
    } 
 
    if (error?.code === 11000) { 
      const duplicateFields = Object.keys(error.keyPattern || {}); 
 
      if (duplicateFields.includes("email")) { 
        throw new AppError("An account with this email already exists", 409); 
      } 
 
      if (duplicateFields.includes("employeeId")) { 
        throw new AppError("Employee ID already exists", 409); 
      } 
 
      if (duplicateFields.includes("user")) { 
        throw new AppError("Employee profile already exists for this user", 409); 
      } 
 
      throw new AppError("Duplicate employee data", 409); 
    } 
 
    if (error instanceof AppError) { 
      throw error; 
    } 
 
    throw error; 
  } finally { 
    await session.endSession(); 
  } 
}; 
 
/** 
 * Get Employees 
 */ 
const getEmployees = async ({ 
  page = 1, 
  limit = 10, 
  search = "", 
  department = "", 
} = {}, currentUser) => { 
  const currentPage = Math.max(Number(page) || 1, 1); 
  const perPage = Math.min(Math.max(Number(limit) || 10, 1), 100); 
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
 
  if (typeof search === "string" && search.trim()) { 
    const searchRegex = new RegExp( 
      search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), 
      "i" 
    ); 
 
    filter.$or = [ 
      { employeeId: searchRegex }, 
      { department: searchRegex }, 
      { designation: searchRegex }, 
    ]; 
  } 
 
  if (typeof department === "string" && department.trim()) { 
    filter.department = department.trim(); 
  } 
 
  const [employees, total] = await Promise.all([ 
    Employee.find(filter) 
      .populate({ 
        path: "user", 
        select: "_id name email role isActive managerId", 
      }) 
      .sort({ createdAt: -1 }) 
      .skip(skip) 
      .limit(perPage) 
      .lean(), 
    Employee.countDocuments(filter), 
  ]); 
 
  return { 
    employees, 
    pagination: { 
      page: currentPage, 
      limit: perPage, 
      total, 
      totalPages: Math.ceil(total / perPage), 
    }, 
  }; 
}; 

/**
 * Get active managers
 * Admin use only
 */
const getManagers = async (currentUser) => {
  if (currentUser.role !== "admin") {
    throw new AppError(
      "Only admin can view managers",
      403
    );
  }

  const managers = await User.find({
    role: "manager",
    isActive: true,
  })
    .select("_id name email isActive")
    .sort({ name: 1 })
    .lean();

  return managers;
};
 
/** 
 * Get Employee By ID 
 */ 
const getEmployeeById = async (employeeId, currentUser) => { 
  if (!mongoose.Types.ObjectId.isValid(employeeId)) { 
    throw new AppError("Invalid employee ID", 400); 
  } 
 
  const employee = await Employee.findById(employeeId) 
    .populate({ 
      path: "user", 
      select: "_id name email role isActive managerId", 
    }) 
    .lean(); 
 
  if (!employee) { 
    throw new AppError("Employee not found", 404); 
  } 
 
  // IDOR Protection: Prevent manager from accessing other team's employees 
  if ( 
    currentUser.role === "manager" && 
    employee.user?.managerId?.toString() !== currentUser._id.toString() 
  ) { 
    throw new AppError("You are not authorized to access this employee", 403); 
  } 
 
  return employee; 
}; 
 
/** 
 * Update Employee 
 */ 
const updateEmployee = async (employeeId, updates, currentUser) => { 
  if (!mongoose.Types.ObjectId.isValid(employeeId)) { 
    throw new AppError("Invalid employee ID", 400); 
  } 
 
  const allowedUpdates = [ 
    "department", 
    "designation", 
    "phone", 
    "joiningDate", 
  ]; 
 
  const safeUpdates = {}; 
 
  for (const field of allowedUpdates) { 
    if (updates[field] !== undefined) { 
      safeUpdates[field] = updates[field]; 
    } 
  } 
 
  if (Object.keys(safeUpdates).length === 0) { 
    throw new AppError("No valid fields provided for update", 400); 
  } 
 
  const targetEmployee = await Employee.findById(employeeId).populate("user"); 
   
  if (!targetEmployee) { 
    throw new AppError("Employee not found", 404); 
  } 
 
  // IDOR Protection for Manager 
  if ( 
    currentUser.role === "manager" && 
    targetEmployee.user?.managerId?.toString() !== currentUser._id.toString() 
  ) { 
    throw new AppError("You are not authorized to update this employee", 403); 
  } 
 
  const employee = await Employee.findByIdAndUpdate( 
    employeeId, 
    safeUpdates, 
    { 
      new: true, 
      runValidators: true, 
    } 
  ) 
    .populate({ 
      path: "user", 
      select: "_id name email role isActive managerId", 
    }) 
    .lean(); 
 
  return employee; 
}; 
 
/** 
 * Assign / change manager for an employee 
 * Only admin is allowed to perform this action. 
 */ 
const assignManager = async (employeeId, managerId, currentUser) => { 
  if (currentUser.role !== "admin") { 
    throw new AppError( 
      "Only admin can assign employees to a manager", 
      403 
    ); 
  } 
 
  if (!mongoose.Types.ObjectId.isValid(employeeId)) { 
    throw new AppError("Invalid employee ID", 400); 
  } 
 
  if (!mongoose.Types.ObjectId.isValid(managerId)) { 
    throw new AppError("Invalid manager ID", 400); 
  } 
 
  const employee = await Employee.findById(employeeId).populate("user"); 
 
  if (!employee) { 
    throw new AppError("Employee not found", 404); 
  } 
 
  if (!employee.user) { 
    throw new AppError("Employee user account not found", 404); 
  } 
 
  // Only employee accounts can be assigned to a manager. 
  if (employee.user.role !== "employee") { 
    throw new AppError( 
      "Only employee accounts can be assigned to a manager", 
      400 
    ); 
  } 
 
  const manager = await User.findOne({ 
    _id: managerId, 
    role: "manager", 
    isActive: true, 
  }).select("_id name email role isActive"); 
 
  if (!manager) { 
    throw new AppError( 
      "Selected manager not found or inactive", 
      400 
    ); 
  } 
 
  const updatedUser = await User.findByIdAndUpdate( 
    employee.user._id, 
    { 
      managerId: manager._id, 
    }, 
    { 
      new: true, 
      runValidators: true, 
    } 
  ) 
    .select("_id name email role isActive managerId") 
    .lean(); 
 
  return { 
    employee: employee.toObject(), 
    user: updatedUser, 
    manager, 
  }; 
}; 
 
/** 
 * Update Employee Status 
 */ 
const updateEmployeeStatus = async (employeeId, status, currentUser) => { 
  if (!mongoose.Types.ObjectId.isValid(employeeId)) { 
    throw new AppError("Invalid employee ID", 400); 
  } 
 
  if (!["active", "inactive"].includes(status)) { 
    throw new AppError( 
      "Status must be either active or inactive", 
      400 
    ); 
  } 
 
  const targetEmployee = await Employee.findById(employeeId).populate("user"); 
 
  if (!targetEmployee) { 
    throw new AppError("Employee not found", 404); 
  } 
 
  if (!targetEmployee.user) { 
    throw new AppError( 
      "Employee user account not found", 
      404 
    ); 
  } 
 
  // Manager can only update employees from their own team 
  if ( 
    currentUser.role === "manager" && 
    targetEmployee.user.managerId?.toString() !== 
      currentUser._id.toString() 
  ) { 
    throw new AppError( 
      "You are not authorized to update this employee's status", 
      403 
    ); 
  } 
 
  const session = await mongoose.startSession(); 
 
  try { 
    session.startTransaction(); 
 
    // Update Employee profile status 
    const employee = await Employee.findByIdAndUpdate( 
      employeeId, 
      { status }, 
      { 
        new: true, 
        runValidators: true, 
        session, 
      } 
    ); 
 
    if (!employee) { 
      throw new AppError("Employee not found", 404); 
    } 
 
    // Keep login/account status in sync 
    await User.findByIdAndUpdate( 
      targetEmployee.user._id, 
      { 
        isActive: status === "active", 
      }, 
      { 
        new: true, 
        runValidators: true, 
        session, 
      } 
    ); 
 
    await session.commitTransaction(); 
 
    // Return fresh employee data 
    const updatedEmployee = await Employee.findById(employeeId) 
      .populate({ 
        path: "user", 
        select: "_id name email role isActive managerId", 
      }) 
      .lean(); 
 
    return updatedEmployee; 
  } catch (error) { 
    if (session.inTransaction()) { 
      await session.abortTransaction(); 
    } 
 
    throw error; 
  } finally { 
    await session.endSession(); 
  } 
}; 

/**
 * Create Manager
 * Only admin can create manager accounts.
 */
const createManager = async (data, currentUser) => {
  if (currentUser.role !== "admin") {
    throw new AppError(
      "Only admin can create managers",
      403
    );
  }

  const {
    name,
    email,
    password,
  } = data;

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new AppError(
      "An account with this email already exists",
      409
    );
  }

  const manager = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "manager",
    managerId: null,
    isActive: true,
  });

  return {
    _id: manager._id,
    name: manager.name,
    email: manager.email,
    role: manager.role,
    isActive: manager.isActive,
    createdAt: manager.createdAt,
  };
};
 
module.exports = { 
  createEmployee, 
  getEmployees, 
  getEmployeeById, 
  updateEmployee, 
  updateEmployeeStatus, 
  assignManager, 
  getManagers,
  createManager,
};