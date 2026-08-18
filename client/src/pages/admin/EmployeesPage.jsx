import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetEmployeesQuery,
  useGetManagersQuery,
  useUpdateEmployeeStatusMutation,
  useAssignManagerMutation,
} from "../../services/api";

const EmployeesPage = () => {
  const navigate = useNavigate();

  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [selectedManagerId, setSelectedManagerId] =
    useState("");

  const {
    data,
    isLoading,
    isError,
  } = useGetEmployeesQuery({
    page: 1,
    limit: 50,
  });

  const {
    data: managersData,
    isLoading: managersLoading,
    isError: managersError,
  } = useGetManagersQuery();

  const [updateStatus, { isLoading: updating }] =
    useUpdateEmployeeStatusMutation();

  const [assignManager, { isLoading: assigningManager }] =
    useAssignManagerMutation();

  const employees = (data?.data?.employees || []).filter(
    (employee) => employee.user?.role === "employee"
  );

  const managers =
    managersData?.data?.managers || [];

  const handleStatus = async (employee) => {
    const newStatus =
      employee.status === "active"
        ? "inactive"
        : "active";

    try {
      await updateStatus({
        id: employee._id,
        status: newStatus,
      }).unwrap();
    } catch (error) {
      console.error(
        "Status update failed:",
        error
      );
    }
  };

  const handleAssignManager = async () => {
    if (!selectedEmployee || !selectedManagerId) {
      return;
    }

    try {
      await assignManager({
        id: selectedEmployee._id,
        managerId: selectedManagerId,
      }).unwrap();

      setSelectedEmployee(null);
      setSelectedManagerId("");
    } catch (error) {
      console.error(
        "Manager assignment failed:",
        error
      );
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-56 bg-gray-200 rounded" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-status-error-bg border border-status-error-text/20 rounded-xl p-6">
            <p className="text-status-error-text">
              Failed to load employees.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight">
              Employees
            </h1>

            <p className="text-text-secondary mt-1">
              Manage employee profiles, managers and status
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">

          {employees.length === 0 ? (
            <div className="p-8 text-text-secondary text-sm text-center">
              No employees found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">

                <thead className="bg-gray-100/70 border-b border-border">
                  <tr>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Employee ID
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Name
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Email
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Department
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Designation
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Manager
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Status
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee) => (
                    <tr
                      key={employee._id}
                      className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-text-body whitespace-nowrap">
                        {employee.employeeId}
                      </td>

                      <td className="p-4 font-medium text-text-heading whitespace-nowrap">
                        {employee.user?.name}
                      </td>

                      <td className="p-4 text-text-body whitespace-nowrap">
                        {employee.user?.email}
                      </td>

                      <td className="p-4 text-text-body whitespace-nowrap">
                        {employee.department}
                      </td>

                      <td className="p-4 text-text-body whitespace-nowrap">
                        {employee.designation}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {employee.user?.managerId ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-status-neutral-bg text-status-neutral-text">
                            Assigned
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-status-pending-bg text-status-pending-text">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          employee.status === "active" 
                            ? "bg-status-success-bg text-status-success-text" 
                            : "bg-status-error-bg text-status-error-text"
                        }`}>
                          {employee.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/employees/${employee._id}/edit`
                              )
                            }
                            className="px-3 py-1.5 text-sm border border-border rounded-lg text-text-body hover:bg-gray-100 hover:border-gray-300 transition-colors"
                          >
                            Edit
                          </button>

                          {employee.user?.role === "employee" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setSelectedManagerId(
                                  employee.user?.managerId?._id ||
                                  employee.user?.managerId ||
                                  ""
                                );
                              }}
                              disabled={
                                managersLoading ||
                                managersError ||
                                assigningManager
                              }
                              className="px-3 py-1.5 text-sm border border-border rounded-lg text-text-body hover:bg-gray-100 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {employee.user?.managerId
                                ? "Change Manager"
                                : "Assign Manager"}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleStatus(employee)
                            }
                            disabled={updating}
                            className="px-3 py-1.5 text-sm border border-border rounded-lg text-text-body hover:bg-gray-100 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {employee.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

      {selectedEmployee && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl shadow-xl border border-border w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-text-heading">
              Assign Manager
            </h2>

            <p className="text-sm text-text-secondary mt-1 mb-5">
              {selectedEmployee.user?.name}
            </p>

            <label className="block text-sm font-medium text-text-body mb-2">
              Select Manager
            </label>

            <select
              value={selectedManagerId}
              onChange={(event) =>
                setSelectedManagerId(event.target.value)
              }
              className="w-full border border-input-border rounded-lg px-3 py-2.5 mb-5 text-text-body bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
            >
              <option value="">
                Select a manager
              </option>

              {managers.map((manager) => (
                <option
                  key={manager._id}
                  value={manager._id}
                >
                  {manager.name} ({manager.email})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedEmployee(null);
                  setSelectedManagerId("");
                }}
                className="px-4 py-2 border border-border rounded-lg text-text-body hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAssignManager}
                disabled={
                  !selectedManagerId ||
                  assigningManager ||
                  managersLoading
                }
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover active:bg-brand-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigningManager
                  ? "Assigning..."
                  : "Assign Manager"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default EmployeesPage;