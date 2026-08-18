import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetEmployeesQuery } from "../../services/api";

const ManagerTeamPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  const {
    data,
    isLoading,
    isError,
  } = useGetEmployeesQuery({
    search,
    department,
    page: 1,
    limit: 100,
  });

  const employees = data?.data?.employees || [];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            My Team
          </h1>

          <p className="text-gray-500 mt-1">
            View employees assigned to you
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <label className="block mb-2 font-medium">
                Search
              </label>

              <input
                type="text"
                placeholder="Employee ID, department or designation"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Department
              </label>

              <input
                type="text"
                placeholder="Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>

          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="p-5 border-b">
            <h2 className="text-xl font-semibold">
              Team Members
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {employees.length} team member
              {employees.length !== 1 ? "s" : ""}
            </p>
          </div>

          {isLoading && (
            <div className="p-6 text-gray-500">
              Loading team members...
            </div>
          )}

          {isError && (
            <div className="p-6">
              <div className="p-4 rounded-lg bg-red-50 text-red-700">
                Failed to load team members.
              </div>
            </div>
          )}

          {!isLoading && !isError && employees.length === 0 && (
            <div className="p-6 text-gray-500">
              No team members found.
            </div>
          )}

          {!isLoading && !isError && employees.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">

                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">
                      Employee ID
                    </th>

                    <th className="text-left p-4 font-medium">
                      Name
                    </th>

                    <th className="text-left p-4 font-medium">
                      Email
                    </th>

                    <th className="text-left p-4 font-medium">
                      Department
                    </th>

                    <th className="text-left p-4 font-medium">
                      Designation
                    </th>

                    <th className="text-left p-4 font-medium">
                      Status
                    </th>

                    <th className="text-left p-4 font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee) => (
                    <tr
                      key={employee._id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium">
                        {employee.employeeId}
                      </td>

                      <td className="p-4">
                        {employee.user?.name || "-"}
                      </td>

                      <td className="p-4 text-gray-600">
                        {employee.user?.email || "-"}
                      </td>

                      <td className="p-4">
                        {employee.department}
                      </td>

                      <td className="p-4">
                        {employee.designation}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            employee.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {employee.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/manager/team/${employee._id}`
                            )
                          }
                          className="px-3 py-2 border rounded-lg hover:bg-gray-100"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default ManagerTeamPage;