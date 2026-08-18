import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useGetMyAttendanceQuery,
  useGetMyOvertimeQuery,
} from "../../services/api";

import {
  FiClock,
  FiLogIn,
  FiLogOut,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  const [liveWorkingMinutes, setLiveWorkingMinutes] = useState(0);

  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    isError: attendanceError,
  } = useGetMyAttendanceQuery({
    page: 1,
    limit: 100,
  });

  const {
    data: overtimeData,
    isLoading: overtimeLoading,
    isError: overtimeError,
  } = useGetMyOvertimeQuery({
    page: 1,
    limit: 100,
  });

  const attendance = attendanceData?.data?.attendance || [];
  const overtimeRequests = overtimeData?.data?.overtime || [];

  const isLoading = attendanceLoading || overtimeLoading;
  const isError = attendanceError || overtimeError;

  // Find today's attendance instead of assuming the first record is today.
  const todayAttendance = useMemo(() => {
    const now = new Date();

    return attendance.find((item) => {
      if (!item.date) {
        return false;
      }

      const attendanceDate = new Date(item.date);

      return (
        attendanceDate.getFullYear() === now.getFullYear() &&
        attendanceDate.getMonth() === now.getMonth() &&
        attendanceDate.getDate() === now.getDate()
      );
    });
  }, [attendance]);

  // Live timer for working minutes
  useEffect(() => {
    if (!todayAttendance?.checkIn || todayAttendance?.checkOut) {
      setLiveWorkingMinutes(
        Number(todayAttendance?.workingMinutes) || 0
      );

      return;
    }

    const updateLiveWorkingTime = () => {
      const checkInTime = new Date(todayAttendance.checkIn);
      const now = new Date();

      if (
        Number.isNaN(checkInTime.getTime())
      ) {
        setLiveWorkingMinutes(0);
        return;
      }

      const elapsedMinutes = Math.max(
        0,
        Math.floor(
          (now.getTime() - checkInTime.getTime()) /
            60000
        )
      );

      setLiveWorkingMinutes(elapsedMinutes);
    };

    updateLiveWorkingTime();

    const intervalId = setInterval(
      updateLiveWorkingTime,
      60000
    );

    return () => clearInterval(intervalId);
  }, [
    todayAttendance?.checkIn,
    todayAttendance?.checkOut,
    todayAttendance?.workingMinutes,
  ]);

  const overtimeSummary = useMemo(() => {
    return {
      pending: overtimeRequests.filter(
        (item) => item.status === "pending"
      ).length,

      approved: overtimeRequests.filter(
        (item) => item.status === "approved"
      ).length,

      rejected: overtimeRequests.filter(
        (item) => item.status === "rejected"
      ).length,
    };
  }, [overtimeRequests]);

  const formatDate = (value) => {
    if (!value) {
      return "--";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return "--";
    }

    return parsedDate.toLocaleDateString();
  };

  const formatTime = (value) => {
    if (!value) {
      return "--";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return "--";
    }

    return parsedDate.toLocaleTimeString();
  };

  const formatWorkingMinutes = (minutes) => {
    if (
      minutes === undefined ||
      minutes === null ||
      Number.isNaN(Number(minutes))
    ) {
      return "--";
    }

    const totalMinutes = Number(minutes);

    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  };

  const getWorkingStatus = (minutes) => {
    if (
      minutes === undefined ||
      minutes === null ||
      Number.isNaN(Number(minutes))
    ) {
      return {
        label: "Not completed",
        className: "bg-status-neutral-bg text-status-neutral-text",
      };
    }

    if (Number(minutes) >= 480) {
      return {
        label: "Completed",
        className: "bg-status-success-bg text-status-success-text",
      };
    }

    return {
      label: "Incomplete",
      className: "bg-status-pending-bg text-status-pending-text",
    };
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

  const shiftStatus = getWorkingStatus(
    liveWorkingMinutes
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
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
        <div className="max-w-6xl mx-auto">
          <div className="bg-status-error-bg border border-status-error-text/20 rounded-xl p-6">
            <p className="text-status-error-text">
              Failed to load dashboard data.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-hover transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight">
            Employee Dashboard
          </h1>

          <p className="text-text-secondary mt-1">
            Overview of your attendance and overtime
          </p>
        </div>

        {/* Today's Attendance — highlighted primary area */}
        <section className="relative overflow-hidden rounded-xl border border-brand-primary/15 bg-brand-primary/[0.06] p-4 sm:p-6">
          <div
            className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-brand-primary/10"
            aria-hidden="true"
          />

          <h2 className="text-lg font-bold text-text-heading mb-4 relative">
            Today's Attendance
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">

            {/* Status */}
            <div className="bg-surface rounded-xl border border-border/60 shadow-sm p-5">
              <div className="flex items-center gap-2 text-text-secondary">
                <FiClock className="text-status-info-text" />
                <p className="text-sm">Status</p>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mt-3 capitalize text-text-heading">
                {todayAttendance?.status ||
                  "Not checked in"}
              </h3>
            </div>

            {/* Check In */}
            <div className="bg-surface rounded-xl border border-border/60 shadow-sm p-5">
              <div className="flex items-center gap-2 text-text-secondary">
                <FiLogIn className="text-status-success-text" />
                <p className="text-sm">Check In</p>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mt-3 text-text-heading">
                {formatTime(todayAttendance?.checkIn)}
              </h3>
            </div>

            {/* Check Out */}
            <div className="bg-surface rounded-xl border border-border/60 shadow-sm p-5">
              <div className="flex items-center gap-2 text-text-secondary">
                <FiLogOut className="text-status-pending-text" />
                <p className="text-sm">Check Out</p>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mt-3 text-text-heading">
                {formatTime(todayAttendance?.checkOut)}
              </h3>
            </div>

            {/* Working Hours */}
            <div className="bg-surface rounded-xl border border-border/60 shadow-sm p-5">
              <p className="text-text-secondary text-sm">
                Working Hours
              </p>

              <h3 className="text-xl sm:text-2xl font-bold mt-3 text-text-heading">
                {formatWorkingMinutes(
                  liveWorkingMinutes
                )}
              </h3>
            </div>

            {/* Shift Status */}
            <div className="bg-surface rounded-xl border border-border/60 shadow-sm p-5">
              <p className="text-text-secondary text-sm">
                Shift Status
              </p>

              <span
                className={`inline-flex mt-3 px-3 py-1 rounded-full text-sm font-medium ${shiftStatus.className}`}
              >
                {shiftStatus.label}
              </span>
            </div>

          </div>
        </section>

        {/* Overtime Summary */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-text-heading">
                Overtime Summary
              </h2>

              <p className="text-text-secondary text-sm mt-1">
                Track your overtime request status
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/employee/overtime")
              }
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-brand-hover"
            >
              View Overtime
              <FiArrowRight />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="bg-status-pending-bg rounded-xl border border-border/60 shadow-sm p-5">
              <div className="flex items-center gap-2 text-text-secondary">
                <FiClock className="text-status-pending-text" />
                <p className="text-sm">Pending</p>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold mt-3 text-text-heading">
                {overtimeSummary.pending}
              </h3>
            </div>

            <div className="bg-status-success-bg rounded-xl border border-border/60 shadow-sm p-5">
              <div className="flex items-center gap-2 text-text-secondary">
                <FiCheckCircle className="text-status-success-text" />
                <p className="text-sm">Approved</p>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold mt-3 text-text-heading">
                {overtimeSummary.approved}
              </h3>
            </div>

            <div className="bg-status-error-bg rounded-xl border border-border/60 shadow-sm p-5">
              <div className="flex items-center gap-2 text-text-secondary">
                <FiAlertCircle className="text-status-error-text" />
                <p className="text-sm">Rejected</p>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold mt-3 text-text-heading">
                {overtimeSummary.rejected}
              </h3>
            </div>

          </div>
        </section>

        {/* Attendance Action */}
        <section className="bg-surface rounded-xl border border-border shadow-sm p-4 sm:p-6 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <h2 className="text-lg font-bold text-text-heading">
                Attendance
              </h2>

              <p className="text-text-secondary mt-1 text-sm">
                Check in or check out using your
                selfie and current location.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/employee/attendance")
              }
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-primary text-white hover:bg-brand-hover active:bg-brand-active transition-colors"
            >
              Manage Attendance
              <FiArrowRight />
            </button>

          </div>
        </section>

        {/* Recent Attendance */}
        <section className="bg-surface rounded-xl border border-border shadow-sm p-4 sm:p-6 mt-6">

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-text-heading">
                Recent Attendance
              </h2>

              <p className="text-text-secondary text-sm mt-1">
                Your latest attendance records
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/employee/attendance")
              }
              className="text-sm font-medium text-brand-primary hover:text-brand-hover"
            >
              View All
            </button>
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
                      Date
                    </th>

                    <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Check In
                    </th>

                    <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Check Out
                    </th>

                    <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Working
                    </th>

                    <th className="p-3 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Status
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
                        <td className="p-3 text-text-body whitespace-nowrap">
                          {formatDate(item.date)}
                        </td>

                        <td className="p-3 text-text-body whitespace-nowrap">
                          {formatTime(item.checkIn)}
                        </td>

                        <td className="p-3 text-text-body whitespace-nowrap">
                          {formatTime(item.checkOut)}
                        </td>

                        <td className="p-3 text-text-body whitespace-nowrap">
                          {formatWorkingMinutes(
                            item.workingMinutes
                          )}
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
                      </tr>
                    ))}
                </tbody>

              </table>
            </div>
          )}

        </section>
      </div>
    </main>
  );
};

export default EmployeeDashboard;