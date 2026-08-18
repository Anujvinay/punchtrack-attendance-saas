import { useState } from "react";
import {
  FiBarChart2,
  FiClock,
  FiRefreshCw,
  FiFilter,
  FiAlertCircle,
} from "react-icons/fi";

import {
  useGetAttendanceReportQuery,
  useGetDailyAttendanceReportQuery,
  useGetOvertimeReportQuery,
} from "../../services/api";

const ReportsPage = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");

  const hasDateRange = Boolean(from && to);

  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    isError: attendanceError,
    error: attendanceQueryError,
    refetch: refetchAttendance,
  } = useGetAttendanceReportQuery(
    {
      from,
      to,
    },
    {
      skip: !hasDateRange,
    }
  );

  const {
    data: dailyAttendanceData,
    isLoading: dailyAttendanceLoading,
    isError: dailyAttendanceError,
    error: dailyAttendanceQueryError,
    refetch: refetchDailyAttendance,
  } = useGetDailyAttendanceReportQuery(
    {
      from,
      to,
    },
    {
      skip: !hasDateRange,
    }
  );

  const {
    data: overtimeData,
    isLoading: overtimeLoading,
    isError: overtimeError,
    error: overtimeQueryError,
    refetch: refetchOvertime,
  } = useGetOvertimeReportQuery(
    {
      from,
      to,
      ...(status && { status }),
    },
    {
      skip: !hasDateRange,
    }
  );

  const attendanceReport =
    attendanceData?.data || null;

  const dailyAttendanceRecords =
    dailyAttendanceData?.data?.records || [];

  const overtimeEmployees =
    overtimeData?.data?.employees || [];

  const formatMinutes = (minutes) => {
    if (
      minutes === undefined ||
      minutes === null ||
      Number.isNaN(Number(minutes))
    ) {
      return "0h 0m";
    }

    const totalMinutes = Number(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  };

  const clearFilters = () => {
    setFrom("");
    setTo("");
    setStatus("");
  };

  const handleRefresh = () => {
    if (!hasDateRange) {
      return;
    }

    refetchAttendance();
    refetchDailyAttendance();
    refetchOvertime();
  };

  const validationMessage =
    from && to && from > to
      ? "From date cannot be after to date."
      : "";

  const isLoading =
    attendanceLoading || dailyAttendanceLoading || overtimeLoading;

  const attendanceStatCards = attendanceReport
    ? [
        {
          label: "Total Employees",
          value: attendanceReport.employees?.total ?? 0,
          tint: "bg-status-info-bg",
        },
        {
          label: "Present",
          value: attendanceReport.attendance?.present ?? 0,
          tint: "bg-status-success-bg",
        },
        {
          label: "Absent",
          value: attendanceReport.attendance?.absent ?? 0,
          tint: "bg-status-error-bg",
        },
        {
          label: "Late",
          value: attendanceReport.attendance?.late ?? 0,
          tint: "bg-status-pending-bg",
        },
        {
          label: "Half Day",
          value: attendanceReport.attendance?.halfDay ?? 0,
          tint: "bg-status-info-bg",
        },
        {
          label: "Working Time",
          value: formatMinutes(
            attendanceReport.working?.totalWorkingMinutes
          ),
          tint: "bg-gray-100",
        },
        {
          label: "Overtime",
          value: formatMinutes(
            attendanceReport.working?.totalOvertimeMinutes
          ),
          tint: "bg-brand-primary/[0.06]",
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight">
            Reports
          </h1>

          <p className="text-text-secondary mt-1">
            View attendance and overtime reports
          </p>
        </div>

        {/* Filters */}
        <section className="bg-surface rounded-xl border border-border shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-4">
            <FiFilter />
            <span>Filters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <div>
              <label
                htmlFor="report-from"
                className="block text-sm font-medium text-text-body mb-2"
              >
                From Date
              </label>

              <input
                id="report-from"
                type="date"
                value={from}
                onChange={(event) =>
                  setFrom(event.target.value)
                }
                className="w-full border border-input-border rounded-lg px-4 py-2.5 text-text-body bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="report-to"
                className="block text-sm font-medium text-text-body mb-2"
              >
                To Date
              </label>

              <input
                id="report-to"
                type="date"
                value={to}
                onChange={(event) =>
                  setTo(event.target.value)
                }
                className="w-full border border-input-border rounded-lg px-4 py-2.5 text-text-body bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="report-status"
                className="block text-sm font-medium text-text-body mb-2"
              >
                Overtime Status
              </label>

              <select
                id="report-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                disabled={!hasDateRange}
                className="w-full border border-input-border rounded-lg px-4 py-2.5 text-text-body bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors disabled:bg-gray-100 disabled:text-text-disabled disabled:cursor-not-allowed"
              >
                <option value="">
                  All statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>
            </div>

            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={!hasDateRange || isLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-primary text-white hover:bg-brand-hover active:bg-brand-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiRefreshCw />
                Refresh
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-body hover:bg-gray-100 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {validationMessage && (
            <p className="mt-4 text-status-error-text text-sm flex items-center gap-1.5">
              <FiAlertCircle className="shrink-0" />
              {validationMessage}
            </p>
          )}

          {!hasDateRange && !validationMessage && (
            <p className="mt-4 text-sm text-text-secondary">
              Select a from and to date to load reports.
            </p>
          )}
        </section>

        {/* Report Errors */}
        {attendanceError && (
          <div className="mb-6 rounded-lg border border-status-error-text/20 bg-status-error-bg p-4 text-status-error-text text-sm">
            {attendanceQueryError?.data?.message ||
              "Failed to load attendance report."}
          </div>
        )}

        {dailyAttendanceError && (
          <div className="mb-6 rounded-lg border border-status-error-text/20 bg-status-error-bg p-4 text-status-error-text text-sm">
            {dailyAttendanceQueryError?.data?.message ||
              "Failed to load daily attendance details."}
          </div>
        )}

        {overtimeError && (
          <div className="mb-6 rounded-lg border border-status-error-text/20 bg-status-error-bg p-4 text-status-error-text text-sm">
            {overtimeQueryError?.data?.message ||
              "Failed to load overtime report."}
          </div>
        )}

        {/* Attendance Summary Report */}
        <section className="bg-surface rounded-xl border border-border shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary shrink-0">
              <FiBarChart2 className="text-lg" />
            </span>

            <div>
              <h2 className="text-lg font-bold text-text-heading">
                Attendance Report Summary
              </h2>

              <p className="text-sm text-text-secondary">
                Attendance summary for selected dates
              </p>
            </div>
          </div>

          {!hasDateRange ? (
            <p className="text-text-secondary text-sm">
              Select a date range to view the
              attendance report.
            </p>
          ) : attendanceLoading ? (
            <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : attendanceReport ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {attendanceStatCards.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-xl border border-border/60 p-5 ${stat.tint}`}
                >
                  <p className="text-sm text-text-secondary">
                    {stat.label}
                  </p>

                  <p className="text-2xl sm:text-3xl font-bold mt-2 text-text-heading">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">
              No attendance report available.
            </p>
          )}
        </section>

        {/* Daily Attendance Details */}
        <section className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden mb-6">
          <div className="p-5 sm:p-6 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-text-heading">
                Daily Attendance Details
              </h2>

              <p className="text-sm text-text-secondary mt-1">
                Detailed attendance records for the selected date range
              </p>
            </div>
          </div>

          {!hasDateRange ? (
            <div className="p-6">
              <p className="text-text-secondary text-sm">
                Select a date range to view daily attendance details.
              </p>
            </div>
          ) : dailyAttendanceLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-5 w-56 bg-gray-200 rounded" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
              </div>
            </div>
          ) : dailyAttendanceRecords.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-text-secondary text-sm">
                No attendance records found for the selected range.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100/70 border-b border-border">
                  <tr>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">Employee</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">Date</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">Check In</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">Check Out</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">Working</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">Status</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">Verification</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">Selfie</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">Location</th>
                  </tr>
                </thead>

                <tbody>
                  {dailyAttendanceRecords.map((record) => {
                    const employeeName =
                      record.user?.name ||
                      "Unknown";

                    const employeeId =
                      record.employee?.employeeId ||
                      "--";

                    const checkInSelfie =
                      record.checkInSelfie;

                    const checkOutSelfie =
                      record.checkOutSelfie;

                    const checkInLocation =
                      record.checkInLocation?.coordinates;

                    const checkOutLocation =
                      record.checkOutLocation?.coordinates;

                    const formatDate = (value) => {
                      if (!value) return "--";

                      const parsed = new Date(value);

                      if (Number.isNaN(parsed.getTime())) {
                        return "--";
                      }

                      return parsed.toLocaleDateString();
                    };

                    const formatTime = (value) => {
                      if (!value) return "--";

                      const parsed = new Date(value);

                      if (Number.isNaN(parsed.getTime())) {
                        return "--";
                      }

                      return parsed.toLocaleTimeString();
                    };

                    const verificationClass =
                      record.verificationStatus === "approved"
                        ? "bg-status-success-bg text-status-success-text"
                        : record.verificationStatus === "rejected"
                        ? "bg-status-error-bg text-status-error-text"
                        : "bg-status-pending-bg text-status-pending-text";

                    return (
                      <tr
                        key={record._id}
                        className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        {/* Employee */}
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-text-heading">
                              {employeeName}
                            </p>

                            <p className="text-sm text-text-secondary">
                              {employeeId}
                            </p>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-4 text-text-body whitespace-nowrap">
                          {formatDate(record.date)}
                        </td>

                        {/* Check In */}
                        <td className="p-4 text-text-body whitespace-nowrap">
                          {formatTime(record.checkIn)}
                        </td>

                        {/* Check Out */}
                        <td className="p-4 text-text-body whitespace-nowrap">
                          {formatTime(record.checkOut)}
                        </td>

                        {/* Working */}
                        <td className="p-4 text-text-body whitespace-nowrap">
                          {formatMinutes(record.workingMinutes)}
                        </td>

                        {/* Status */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-status-neutral-bg text-status-neutral-text">
                            {record.status || "--"}
                          </span>
                        </td>

                        {/* Verification */}
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${verificationClass}`}
                          >
                            {record.verificationStatus || "--"}
                          </span>
                        </td>

                        {/* Selfie */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {checkInSelfie ? (
                              <a
                                href={checkInSelfie}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-primary hover:text-brand-hover hover:underline text-sm"
                              >
                                Check-in
                              </a>
                            ) : (
                              <span className="text-text-disabled text-sm">
                                No check-in
                              </span>
                            )}

                            {checkOutSelfie ? (
                              <a
                                href={checkOutSelfie}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-primary hover:text-brand-hover hover:underline text-sm"
                              >
                                Check-out
                              </a>
                            ) : (
                              <span className="text-text-disabled text-sm">
                                No check-out
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* Location */}
                        <td className="p-4">
                          <div className="text-xs text-text-secondary whitespace-nowrap">
                            {checkInLocation ? (
                              <div>
                                <span className="font-semibold text-text-body">In:</span>{" "}
                                {checkInLocation[1]?.toFixed(6)},{" "}
                                {checkInLocation[0]?.toFixed(6)}
                              </div>
                            ) : (
                              <div>In: --</div>
                            )}

                            {checkOutLocation ? (
                              <div className="mt-1">
                                <span className="font-semibold text-text-body">Out:</span>{" "}
                                {checkOutLocation[1]?.toFixed(6)},{" "}
                                {checkOutLocation[0]?.toFixed(6)}
                              </div>
                            ) : (
                              <div className="mt-1">
                                Out: --
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Overtime Report */}
        <section className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden mb-6">

          <div className="p-5 sm:p-6 border-b border-border flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-status-pending-bg text-status-pending-text shrink-0">
              <FiClock className="text-lg" />
            </span>

            <div>
              <h2 className="text-lg font-bold text-text-heading">
                Overtime Report
              </h2>

              <p className="text-sm text-text-secondary">
                Employee-wise overtime summary
              </p>
            </div>
          </div>

          {!hasDateRange ? (
            <div className="p-6">
              <p className="text-text-secondary text-sm">
                Select a date range to view the
                overtime report.
              </p>
            </div>
          ) : overtimeLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-5 w-56 bg-gray-200 rounded" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
              </div>
            </div>
          ) : overtimeEmployees.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-text-secondary text-sm">
                No overtime data found for the
                selected range.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">

                <thead className="bg-gray-100/70 border-b border-border">
                  <tr>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Employee
                    </th>

                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Employee ID
                    </th>

                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Department
                    </th>

                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Requests
                    </th>

                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Total
                    </th>

                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Approved
                    </th>

                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Pending
                    </th>

                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Rejected
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {overtimeEmployees.map(
                    (employee) => (
                      <tr
                        key={employee._id}
                        className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-text-heading">
                              {employee.name || "--"}
                            </p>

                            <p className="text-sm text-text-secondary">
                              {employee.email || "--"}
                            </p>
                          </div>
                        </td>

                        <td className="p-4 text-text-body whitespace-nowrap">
                          {employee.employeeId || "--"}
                        </td>

                        <td className="p-4 text-text-body whitespace-nowrap">
                          {employee.department || "--"}
                        </td>

                        <td className="p-4 text-text-body whitespace-nowrap">
                          {employee.totalRequests ?? 0}
                        </td>

                        <td className="p-4 text-text-body whitespace-nowrap">
                          {formatMinutes(
                            employee.totalMinutes
                          )}
                        </td>

                        <td className="p-4 text-status-success-text whitespace-nowrap">
                          {formatMinutes(
                            employee.approvedMinutes
                          )}
                        </td>

                        <td className="p-4 text-status-pending-text whitespace-nowrap">
                          {formatMinutes(
                            employee.pendingMinutes
                          )}
                        </td>

                        <td className="p-4 text-status-error-text whitespace-nowrap">
                          {formatMinutes(
                            employee.rejectedMinutes
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>

              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
};

export default ReportsPage;