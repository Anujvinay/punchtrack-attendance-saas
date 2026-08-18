const employeeService = require("../services/employeeService");

const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(
      req.body,
      req.user // ✅ Added req.user
    );

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: {
        employee,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEmployees = async (req, res, next) => {
  try {
    const result = await employeeService.getEmployees(
      req.query,
      req.user // ✅ Added req.user
    );

    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(
      req.params.id,
      req.user // ✅ Added req.user
    );

    return res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      data: {
        employee,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(
      req.params.id,
      req.body,
      req.user // ✅ Added req.user
    );

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: {
        employee,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployeeStatus = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployeeStatus(
      req.params.id,
      req.body.status,
      req.user // ✅ Added req.user
    );

    return res.status(200).json({
      success: true,
      message: "Employee status updated successfully",
      data: {
        employee,
      },
    });
  } catch (error) {
    next(error);
  }
};

const assignManager = async (req, res, next) => {
  try {
    const result = await employeeService.assignManager(
      req.params.id,
      req.body.managerId,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Manager assigned successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getManagers = async (req, res, next) => {
  try {
    const managers = await employeeService.getManagers(req.user);

    return res.status(200).json({
      success: true,
      message: "Managers fetched successfully",
      data: {
        managers,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createManager = async (req, res, next) => {
  try {
    const manager = await employeeService.createManager(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Manager created successfully",
      data: {
        manager,
      },
    });
  } catch (error) {
    next(error);
  }
};




module.exports = {
  updateEmployee,
  getEmployeeById,
  getEmployees,
  updateEmployeeStatus,
  assignManager,
  getManagers,
   createManager,
};