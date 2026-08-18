import {
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";

import {
  useGetEmployeesQuery,
  useGetAllAttendanceQuery,
  useGetAllOvertimeQuery,
} from "../../services/api";

const ManagerDashboard = () => {
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
  } = useGetAllAttendanceQuery({
    page: 1,
    limit: 100,
  });

  const {
    data: overtimeData,
    isLoading: overtimeLoading,
  } = useGetAllOvertimeQuery({
    page: 1,
    limit: 100,
    status: "pending",
  });

  const employees =
    employeeData?.data?.employees || [];

  const attendance =
    attendanceData?.data?.attendance || [];

  const overtime =
    overtimeData?.data?.overtime || [];

  const presentToday = attendance.filter(
    (item) =>
      item.status === "present" ||
      item.status === "late" ||
      item.status === "half-day"
  ).length;

  const absentToday = Math.max(
    employees.length - presentToday,
    0
  );

  const pendingAttendance = attendance.filter(
    (item) =>
      item.verificationStatus === "pending"
  ).length;

  const isLoading =
    employeesLoading ||
    attendanceLoading ||
    overtimeLoading;

  const statCards = [
    {
      label: "Team Members",
      value: employees.length,
      icon: FiUsers,
      cardBg: "bg-status-info-bg",
      iconText: "text-status-info-text",
    },
    {
      label: "Present Today",
      value: presentToday,
      icon: FiCheckCircle,
      cardBg: "bg-status-success-bg",
      iconText: "text-status-success-text",
    },
    {
      label: "Absent Today",
      value: absentToday,
      icon: FiXCircle,
      cardBg: "bg-status-error-bg",
      iconText: "text-status-error-text",
    },
    {
      label: "Pending Overtime",
      value: overtime.length,
      icon: FiClock,
      cardBg: "bg-status-pending-bg",
      iconText: "text-status-pending-text",
    },
  ];

  const getVerificationBadge = (status) => {
    const value = status || "pending";
    const styles = {
      verified: "bg-status-success-bg text-status-success-text",
      invalid: "bg-status-error-bg text-status-error-text",
      pending: "bg-status-pending-bg text-status-pending-text",
    };
    return styles[value] || "bg-status-neutral-bg text-status-neutral-text";
  };

  const getAttendanceStatusBadge = (status) => {
    const styles = {
      present: "bg-status-success-bg text-status-success-text",
      late: "bg-status-pending-bg text-status-pending-text",
      "half-day": "bg-status-info-bg text-status-info-text",
      absent: "bg-status-error-bg text-status-error-text",
    };
    return styles[status] || "bg-status-neutral-bg text-status-neutral-text";
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight">
            Manager Dashboard
          </h1>

          <p className="text-text-secondary mt-1">
            Overview of your team attendance and
            overtime
          </p>
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-56 bg-gray-200 rounded" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* STATS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {statCards.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className={`rounded-xl border border-border/60 shadow-sm p-5 ${stat.cardBg}`}
                  >
                    <div className="flex items-center gap-3 text-text-secondary">
                      <span
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/70 ${stat.iconText}`}
                      >
                        <Icon className="text-base" />
                      </span>
                      <span className="text-sm">{stat.label}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold mt-3 text-text-heading">
                      {stat.value}
                    </h2>
                  </div>
                );
              })}
            </section>

            {/* TEAM ATTENDANCE */}
            <section className="bg-surface rounded-xl border border-border shadow-sm p-4 sm:p-6 mt-6">

              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-text-heading">
                    Team Attendance
                  </h2>

                  <p className="text-text-secondary text-sm mt-1">
                    Latest attendance records from
                    your team
                  </p>
                </div>
              </div>

              {attendance.length === 0 ? (
                <p className="text-text-secondary text-sm py-4">
                  No attendance records found.
                </p>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full text-left border-collapse">

                    <thead>
                      <tr className="bg-gray-100/70 border-y border-border">
                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                          Employee
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                          Date
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                          Check In
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                          Check Out
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                          Status
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                          Verification
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {attendance
                        .slice(0, 5)
                        .map((item) => (
                          <tr
                            key={item._id}
                            className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-3">
                              <div>
                                <p className="font-medium text-text-heading">
                                  {item.user?.name ||
                                    "Unknown"}
                                </p>

                                <p className="text-sm text-text-secondary">
                                  {item.employee
                                    ?.employeeId ||
                                    "--"}
                                </p>
                              </div>
                            </td>

                            <td className="p-3 text-text-body whitespace-nowrap">
                              {item.date
                                ? new Date(
                                    item.date
                                  ).toLocaleDateString()
                                : "--"}
                            </td>

                            <td className="p-3 text-text-body whitespace-nowrap">
                              {item.checkIn
                                ? new Date(
                                    item.checkIn
                                  ).toLocaleTimeString()
                                : "--"}
                            </td>

                            <td className="p-3 text-text-body whitespace-nowrap">
                              {item.checkOut
                                ? new Date(
                                    item.checkOut
                                  ).toLocaleTimeString()
                                : "--"}
                            </td>

                            <td className="p-3">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getAttendanceStatusBadge(
                                  item.status
                                )}`}
                              >
                                {item.status || "--"}
                              </span>
                            </td>

                            <td className="p-3">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getVerificationBadge(
                                  item.verificationStatus
                                )}`}
                              >
                                {item.verificationStatus ||
                                  "pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>

                  </table>
                </div>
              )}

            </section>

            {/* PENDING OVERTIME */}
            <section className="bg-surface rounded-xl border border-border shadow-sm p-4 sm:p-6 mt-6">

              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-text-heading">
                    Pending Overtime
                  </h2>

                  <p className="text-text-secondary text-sm mt-1">
                    Overtime requests waiting for review
                  </p>
                </div>

                <FiArrowRight className="text-lg text-text-secondary shrink-0" />
              </div>

              {overtime.length === 0 ? (
                <p className="text-text-secondary text-sm py-4">
                  No pending overtime requests.
                </p>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full text-left border-collapse">

                    <thead>
                      <tr className="bg-gray-100/70 border-y border-border">
                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                          Employee
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                          Date
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                          Overtime
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                          Reason
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {overtime
                        .slice(0, 5)
                        .map((item) => (
                          <tr
                            key={item._id}
                            className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-3 font-medium text-text-heading whitespace-nowrap">
                              {item.user?.name ||
                                "Unknown"}
                            </td>

                            <td className="p-3 text-text-body whitespace-nowrap">
                              {item.date
                                ? new Date(
                                    item.date
                                  ).toLocaleDateString()
                                : "--"}
                            </td>

                            <td className="p-3 text-text-body whitespace-nowrap">
                              {Math.floor(
                                (item.minutes || 0) /
                                  60
                              )}
                              h{" "}
                              {(item.minutes || 0) %
                                60}
                              m
                            </td>

                            <td className="p-3 text-text-body">
                              {item.reason || "--"}
                            </td>

                            <td className="p-3">
                              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-status-pending-bg text-status-pending-text">
                                Pending
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>

                  </table>
                </div>
              )}

            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default ManagerDashboard;