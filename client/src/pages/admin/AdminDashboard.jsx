import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";
import {
  useGetMeQuery,
  useGetEmployeesQuery,
  useGetAttendanceReportQuery,
  useGetOvertimeReportQuery,
} from "../../services/api"; // Ensure path matches your api file location (like ../../app/api if it was created there)

const AdminDashboard = () => {
  const navigate = useNavigate();

  // 1. Current Admin Data
  const { data, isLoading } = useGetMeQuery();
  const user = data?.data?.user;

  // 2. Fetch Dashboard Statistics
  const today = new Date().toISOString().split("T")[0];

  const {
    data: employeeData,
    isLoading: employeesLoading,
  } = useGetEmployeesQuery({
    page: 1,
    limit: 100,
  });

  const {
    data: attendanceData,
    isLoading: attendanceLoading,
  } = useGetAttendanceReportQuery({
    from: today,
    to: today,
  });

  const {
    data: overtimeData,
    isLoading: overtimeLoading,
  } = useGetOvertimeReportQuery({
    from: today,
    to: today,
  });

  // 3. Extract Values safely
  const totalEmployees =
    employeeData?.data?.pagination?.total ??
    employeeData?.data?.employees?.length ??
    0;

  const attendanceSummary =
    attendanceData?.data?.attendance ||
    attendanceData?.data?.summary ||
    {};

  const presentToday = attendanceSummary.present ?? 0;
  const absentToday = attendanceSummary.absent ?? 0;

  const overtimeEmployees = overtimeData?.data?.employees || [];
  const overtimeMinutes = overtimeEmployees.reduce(
    (total, employee) => total + (employee.approvedMinutes || 0),
    0
  );

  const statCards = [
    {
      label: "Total Employees",
      value: employeesLoading ? null : totalEmployees,
      icon: FiUsers,
      cardBg: "bg-status-info-bg",
      iconBg: "bg-white/70",
      iconText: "text-status-info-text",
      valueText: "text-text-heading",
    },
    {
      label: "Present Today",
      value: attendanceLoading ? null : presentToday,
      icon: FiUserCheck,
      cardBg: "bg-status-success-bg",
      iconBg: "bg-white/70",
      iconText: "text-status-success-text",
      valueText: "text-text-heading",
    },
    {
      label: "Absent Today",
      value: attendanceLoading ? null : absentToday,
      icon: FiUserX,
      cardBg: "bg-status-error-bg",
      iconBg: "bg-white/70",
      iconText: "text-status-error-text",
      valueText: "text-text-heading",
    },
    {
      label: "Overtime",
      value: overtimeLoading ? null : `${overtimeMinutes} min`,
      icon: FiClock,
      cardBg: "bg-status-pending-bg",
      iconBg: "bg-white/70",
      iconText: "text-status-pending-text",
      valueText: "text-text-heading",
    },
  ];

  const quickActions = [
    {
      title: "Manage Employees",
      description: "Create, update and manage employees",
      path: "/admin/employees",
      surface: "bg-surface border-border hover:border-brand-primary",
      iconBg: "bg-status-info-bg text-status-info-text",
      icon: FiUsers,
    },
    {
      title: "Attendance",
      description: "View and verify attendance",
      path: "/admin/attendance",
      surface: "bg-surface border-border hover:border-brand-primary",
      iconBg: "bg-status-success-bg text-status-success-text",
      icon: FiUserCheck,
    },
    {
      title: "Reports",
      description: "View attendance and overtime reports",
      path: "/admin/reports",
      surface: "bg-brand-primary/[0.06] border-brand-primary/20 hover:border-brand-primary",
      iconBg: "bg-brand-primary/10 text-brand-primary",
      icon: FiClock,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your attendance management system
          </p>
        </div>

        {/* Admin Info — highlighted primary area with subtle indigo tint */}
        <section className="relative overflow-hidden rounded-xl border border-brand-primary/15 bg-brand-primary/[0.06] p-6 mb-6 shadow-sm">
          <div
            className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-brand-primary/10"
            aria-hidden="true"
          />
          {isLoading ? (
            <div className="animate-pulse space-y-3 relative">
              <div className="h-5 w-48 bg-white/70 rounded" />
              <div className="h-4 w-32 bg-white/70 rounded" />
            </div>
          ) : (
            <div className="relative">
              <h2 className="text-lg font-semibold text-text-heading">
                Welcome, {user?.name || "Admin"}
              </h2>
              <p className="text-text-secondary mt-1 text-sm">{user?.email}</p>
              <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/80 border border-brand-primary/15 text-status-info-text text-xs font-medium">
                Role: {user?.role}
              </span>
            </div>
          )}
        </section>

        {/* Statistics — semantic tinted surfaces, distinct from page canvas */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className={`rounded-xl border border-border/60 shadow-sm p-5 flex items-start justify-between ${stat.cardBg}`}
              >
                <div className="min-w-0">
                  <p className="text-sm text-text-secondary truncate">
                    {stat.label}
                  </p>
                  <h2 className={`text-2xl sm:text-3xl font-bold mt-2 ${stat.valueText}`}>
                    {stat.value === null ? (
                      <span className="inline-block h-8 w-16 bg-white/60 rounded animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </h2>
                </div>

                <span
                  className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.iconBg} ${stat.iconText}`}
                >
                  <Icon className="text-lg" />
                </span>
              </div>
            );
          })}
        </section>

        {/* Quick Actions — mixed neutral/tinted cards, sits directly on page canvas */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-heading">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.path}
                  type="button"
                  onClick={() => navigate(action.path)}
                  className={`group p-5 border rounded-xl text-left shadow-sm hover:shadow-md transition-all ${action.surface}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${action.iconBg}`}
                    >
                      <Icon className="text-lg" />
                    </span>
                    <FiArrowRight className="text-text-disabled group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <h3 className="font-semibold text-text-heading mt-4">
                    {action.title}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;