import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMail, FiPhone, FiCalendar, FiBriefcase, FiHash, FiUser } from "react-icons/fi";
import { useGetEmployeeByIdQuery } from "../../services/api";

const ManagerEmployeeDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetEmployeeByIdQuery(id, {
    skip: !id,
  });

  const employee = data?.data?.employee;

  const BackButton = () => (
    <button
      type="button"
      onClick={() => navigate("/manager/team")}
      className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      <FiArrowLeft className="text-base" aria-hidden="true" />
      Back to Team
    </button>
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <span className="sr-only">Loading employee details…</span>
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    const errorMessage =
      error?.data?.message ||
      "Failed to load employee details.";

    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <BackButton />

          <div
            role="alert"
            className="bg-red-50 border border-red-200 rounded-2xl p-6"
          >
            <p className="text-sm font-medium text-red-700">
              {errorMessage}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!employee) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <BackButton />

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <p className="text-sm text-slate-500">
              Employee not found.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const fields = [
    { label: "Name", value: employee.user?.name, icon: FiUser },
    { label: "Employee ID", value: employee.employeeId, icon: FiHash },
    { label: "Email", value: employee.user?.email, icon: FiMail, breakWords: true },
    { label: "Department", value: employee.department, icon: FiBriefcase },
    { label: "Designation", value: employee.designation, icon: FiBriefcase },
    { label: "Phone", value: employee.phone, icon: FiPhone },
    {
      label: "Joining Date",
      value: employee.joiningDate
        ? new Date(employee.joiningDate).toLocaleDateString()
        : null,
      icon: FiCalendar,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <BackButton />

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Employee Details
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            View employee information
          </p>
        </div>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header strip with identity + status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 bg-indigo-50/60 border-b border-slate-200">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold"
                aria-hidden="true"
              >
                {(employee.user?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {employee.user?.name || "-"}
                </p>
                <p className="text-sm text-slate-500 capitalize truncate">
                  {employee.user?.role || "-"}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 rounded-full text-xs font-medium ${
                employee.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  employee.status === "active" ? "bg-green-600" : "bg-slate-500"
                }`}
                aria-hidden="true"
              />
              {employee.status || "-"}
            </span>
          </div>

          {/* Detail grid */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 p-6">
            {fields.map(({ label, value, icon: Icon, breakWords }) => (
              <div key={label} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
                  aria-hidden="true"
                >
                  <Icon className="text-sm" />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {label}
                  </dt>
                  <dd
                    className={`mt-0.5 text-sm font-medium text-slate-900 ${
                      breakWords ? "break-words" : ""
                    }`}
                  >
                    {value || "-"}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
};

export default ManagerEmployeeDetailsPage;