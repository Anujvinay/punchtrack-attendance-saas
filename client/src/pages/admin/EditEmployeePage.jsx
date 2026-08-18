import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

import {
  useGetEmployeeByIdQuery,
  useUpdateEmployeeMutation,
} from "../../services/api";

const EditEmployeePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data,
    isLoading,
    isError,
  } = useGetEmployeeByIdQuery(id);

  const [updateEmployee, { isLoading: updating }] =
    useUpdateEmployeeMutation();

  const [form, setForm] = useState({
    department: "",
    designation: "",
    phone: "",
    joiningDate: "",
    status: "active",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const employee = data?.data?.employee;

  useEffect(() => {
    if (!employee) return;

    setForm({
      department: employee.department || "",
      designation: employee.designation || "",
      phone: employee.phone || "",
      joiningDate: employee.joiningDate
        ? new Date(employee.joiningDate)
            .toISOString()
            .split("T")[0]
        : "",
      status: employee.status || "active",
    });
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      await updateEmployee({
        id,
        department: form.department.trim(),
        designation: form.designation.trim(),
        phone: form.phone.trim(),
        joiningDate: form.joiningDate,
        status: form.status,
      }).unwrap();

      setSuccess("Employee updated successfully.");

      setTimeout(() => {
        navigate("/admin/employees");
      }, 800);
    } catch (error) {
      console.error("Update employee failed:", error);

      setError(
        error?.data?.message ||
          "Failed to update employee."
      );
    }
  };

  const inputClasses =
    "w-full border border-input-border rounded-lg p-3 text-text-body placeholder:text-text-disabled bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors disabled:bg-gray-100 disabled:text-text-disabled disabled:cursor-not-allowed";

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isError || !employee) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="p-4 rounded-lg bg-status-error-bg border border-status-error-text/20 text-status-error-text text-sm">
            Failed to load employee.
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/employees")
            }
            className="mt-4 px-4 py-2 border border-border rounded-lg text-text-body hover:bg-gray-100 transition-colors"
          >
            Back to Employees
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/employees")
            }
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors mb-3"
          >
            <FiArrowLeft />
            Back to Employees
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight">
            Edit Employee
          </h1>

          <p className="text-text-secondary mt-1">
            Update employee profile
          </p>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-xl border border-border shadow-sm p-5 sm:p-6 space-y-5"
        >

          {/* Employee Information */}

          <div className="p-4 bg-gray-100/70 border border-border rounded-lg text-sm space-y-1.5">
            <p className="text-text-body">
              <span className="font-semibold text-text-heading">
                Employee ID:
              </span>{" "}
              {employee.employeeId}
            </p>

            <p className="text-text-body">
              <span className="font-semibold text-text-heading">
                Name:
              </span>{" "}
              {employee.user?.name || "-"}
            </p>

            <p className="text-text-body">
              <span className="font-semibold text-text-heading">
                Email:
              </span>{" "}
              {employee.user?.email || "-"}
            </p>
          </div>

          {/* Error */}

          {error && (
            <div className="p-3 rounded-lg bg-status-error-bg border border-status-error-text/20 flex items-start gap-2">
              <FiAlertCircle className="text-status-error-text mt-0.5 shrink-0" />
              <p className="text-status-error-text text-sm">{error}</p>
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="p-3 rounded-lg bg-status-success-bg border border-status-success-text/20 flex items-start gap-2">
              <FiCheckCircle className="text-status-success-text mt-0.5 shrink-0" />
              <p className="text-status-success-text text-sm">{success}</p>
            </div>
          )}

          {/* Department */}

          <div>
            <label className="block mb-2 text-sm font-medium text-text-body">
              Department
            </label>

            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              minLength={2}
              maxLength={100}
              required
              className={inputClasses}
            />
          </div>

          {/* Designation */}

          <div>
            <label className="block mb-2 text-sm font-medium text-text-body">
              Designation
            </label>

            <input
              type="text"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              minLength={2}
              maxLength={100}
              required
              className={inputClasses}
            />
          </div>

          {/* Phone */}

          <div>
            <label className="block mb-2 text-sm font-medium text-text-body">
              Phone
            </label>

            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              maxLength={20}
              className={inputClasses}
            />
          </div>

          {/* Joining Date */}

          <div>
            <label className="block mb-2 text-sm font-medium text-text-body">
              Joining Date
            </label>

            <input
              type="date"
              name="joiningDate"
              value={form.joiningDate}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          {/* Status */}

          <div>
            <label className="block mb-2 text-sm font-medium text-text-body">
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>

          {/* Buttons */}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={() =>
                navigate("/admin/employees")
              }
              className="px-5 py-2.5 border border-border rounded-lg text-text-body hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-hover active:bg-brand-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating
                ? "Updating..."
                : "Update Employee"}
            </button>

          </div>
        </form>
      </div>
    </main>
  );
};

export default EditEmployeePage;