import { useEffect, useState } from "react";
import { FiAlertCircle, FiFilter, FiX } from "react-icons/fi";
import {
  useGetAllAttendanceQuery,
  useVerifyAttendanceMutation,
} from "../../services/api";

const AdminAttendancePage = () => {
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);

  const [selectedAttendance, setSelectedAttendance] =
    useState(null);

  const [verificationNote, setVerificationNote] =
    useState("");

  const [verificationMessage, setVerificationMessage] =
    useState("");
  const [verificationError, setVerificationError] =
    useState("");

  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllAttendanceQuery({
    page,
    limit: 10,
    ...(date ? { date } : {}),
    ...(status ? { status } : {}),
  });

  const [
    verifyAttendance,
    { isLoading: verifying },
  ] = useVerifyAttendanceMutation();

  const attendance =
    data?.data?.attendance || [];

  const pagination =
    data?.data?.pagination || {};

  const totalPages =
    pagination.totalPages || 1;

  // =========================
  // OPEN VERIFICATION
  // =========================

  const openVerification = (record) => {
    setSelectedAttendance(record);

    setVerificationNote(
      record.verificationNote || ""
    );

    setVerificationMessage("");
    setVerificationError("");
  };

  // =========================
  // VERIFY ATTENDANCE
  // =========================

  const handleVerification = async (verificationStatus) => {
    if (!selectedAttendance) {
      return;
    }

    try {
      await verifyAttendance({
        id: selectedAttendance._id,
        verificationStatus,
        verificationNote,
      }).unwrap();

      setVerificationMessage(
        verificationStatus === "approved"
          ? "Attendance approved successfully."
          : "Attendance rejected successfully."
      );

      setSelectedAttendance(null);
      setVerificationNote("");
      setVerificationError("");
    } catch (error) {
      console.error(
        "Attendance verification failed:",
        error
      );

      setVerificationError(
        error?.data?.message ||
          "Failed to verify attendance. Please try again."
      );

      setVerificationMessage("");
    }
  };

  // =========================
  // FORMAT TIME
  // =========================

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString();
  };

  // =========================
  // WORKING MINUTES
  // =========================

  const formatWorkingMinutes = (minutes) => {
    if (
      minutes === undefined ||
      minutes === null
    ) {
      return "-";
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  };

  const isSameLocalDay = (valueA, valueB) => {
    if (!valueA || !valueB) {
      return false;
    }

    const dateA = new Date(valueA);
    const dateB = new Date(valueB);

    if (
      Number.isNaN(dateA.getTime()) ||
      Number.isNaN(dateB.getTime())
    ) {
      return false;
    }

    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  };

  const getDisplayWorkingMinutes = (record) => {
    // After checkout, always use backend's final value.
    if (record?.checkOut) {
      return record?.workingMinutes ?? null;
    }

    // Before checkout, calculate live time only for today's record.
    if (
      record?.checkIn &&
      isSameLocalDay(record.checkIn, currentTime)
    ) {
      const checkInTime = new Date(record.checkIn);

      if (Number.isNaN(checkInTime.getTime())) {
        return record?.workingMinutes ?? null;
      }

      return Math.max(
        0,
        Math.floor(
          (currentTime.getTime() - checkInTime.getTime()) /
            60000
        )
      );
    }

    // Historical incomplete record.
    return record?.workingMinutes ?? null;
  };

  // =========================
  // STATUS BADGE
  // =========================

  const getStatusClass = (value) => {
    switch (value) {
      case "present":
        return "bg-status-success-bg text-status-success-text";

      case "late":
        return "bg-status-pending-bg text-status-pending-text";

      case "absent":
        return "bg-status-error-bg text-status-error-text";

      case "half-day":
        return "bg-status-info-bg text-status-info-text";

      default:
        return "bg-status-neutral-bg text-status-neutral-text";
    }
  };

  const getVerificationClass = (value) => {
    switch (value) {
      case "approved":
        return "bg-status-success-bg text-status-success-text";

      case "rejected":
        return "bg-status-error-bg text-status-error-text";

      default:
        return "bg-status-pending-bg text-status-pending-text";
    }
  };

  // =========================
  // LOADING
  // =========================

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight">
            Attendance
          </h1>

          <div className="mt-6 bg-surface rounded-xl border border-border shadow-sm p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-56 bg-gray-200 rounded" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (isError) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">

          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight">
            Attendance
          </h1>

          <div className="mt-6 bg-status-error-bg border border-status-error-text/20 rounded-lg p-5">
            <p className="text-status-error-text">
              Failed to load attendance records.
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-3 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors"
            >
              Try Again
            </button>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">

      <div className="max-w-7xl mx-auto">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-6 sm:mb-8">

          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight">
            Attendance
          </h1>

          <p className="text-text-secondary mt-1">
            View and verify employee attendance
          </p>

        </div>

        {/* =========================
            FILTERS
        ========================= */}

        <div className="bg-surface rounded-xl border border-border shadow-sm p-5 mb-6">

          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-4">
            <FiFilter />
            <span>Filters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* DATE */}

            <div>
              <label className="block text-sm font-medium text-text-body mb-2">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setPage(1);
                }}
                className="w-full border border-input-border rounded-lg px-3 py-2 text-text-body bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
              />
            </div>

            {/* STATUS */}

            <div>
              <label className="block text-sm font-medium text-text-body mb-2">
                Attendance Status
              </label>

              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className="w-full border border-input-border rounded-lg px-3 py-2 text-text-body bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
              >
                <option value="">
                  All Statuses
                </option>

                <option value="present">
                  Present
                </option>

                <option value="late">
                  Late
                </option>

                <option value="absent">
                  Absent
                </option>

                <option value="half-day">
                  Half Day
                </option>
              </select>
            </div>

            {/* RESET */}

            <div className="flex items-end">

              <button
                type="button"
                onClick={() => {
                  setDate("");
                  setStatus("");
                  setPage(1);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-text-body hover:bg-gray-100 transition-colors"
              >
                <FiX className="text-sm" />
                Clear Filters
              </button>

            </div>

          </div>

        </div>

        {/* =========================
            TABLE
        ========================= */}

        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">

          {attendance.length === 0 ? (
            <div className="p-10 text-center text-text-secondary text-sm">
              No attendance records found.
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
                      Date
                    </th>

                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Punch In
                    </th>

                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Punch Out
                    </th>

                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Working Hours
                    </th>

                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Status
                    </th>

                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Verification
                    </th>

                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {attendance.map((record) => (

                    <tr
                      key={record._id}
                      className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                    >

                      {/* EMPLOYEE */}

                      <td className="p-4">

                        <div className="font-medium text-text-heading">
                          {record.user?.name ||
                            "Unknown"}
                        </div>

                        <div className="text-sm text-text-secondary">
                          {record.user?.email ||
                            "-"}
                        </div>

                      </td>

                      {/* EMPLOYEE ID */}

                      <td className="p-4 text-text-body whitespace-nowrap">
                        {record.employee?.employeeId ||
                          "-"}
                      </td>

                      {/* DATE */}

                      <td className="p-4 text-text-body whitespace-nowrap">
                        {record.date
                          ? new Date(
                              record.date
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* PUNCH IN */}

                      <td className="p-4 text-text-body whitespace-nowrap">
                        {formatDateTime(
                          record.checkIn
                        )}
                      </td>

                      {/* PUNCH OUT */}

                      <td className="p-4 text-text-body whitespace-nowrap">
                        {formatDateTime(
                          record.checkOut
                        )}
                      </td>

                      {/* WORKING HOURS */}

                      <td className="p-4 text-text-body whitespace-nowrap">
                        {formatWorkingMinutes(
                          getDisplayWorkingMinutes(record)
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="p-4 whitespace-nowrap">

                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusClass(
                            record.status
                          )}`}
                        >
                          {record.status ||
                            "unknown"}
                        </span>

                      </td>

                      {/* VERIFICATION */}

                      <td className="p-4 whitespace-nowrap">

                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getVerificationClass(
                            record.verificationStatus
                          )}`}
                        >
                          {record.verificationStatus ||
                            "pending"}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="p-4">

                        {record.verificationStatus ===
                          "approved" ||
                        record.verificationStatus ===
                          "rejected" ? (
                          <span className="text-sm text-text-secondary">
                            Verified
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              openVerification(
                                record
                              )
                            }
                            className="px-3 py-1.5 text-sm border border-border rounded-lg text-text-body hover:bg-gray-100 hover:border-gray-300 transition-colors"
                          >
                            Review
                          </button>
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* =========================
            PAGINATION
        ========================= */}

        {attendance.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">

            <p className="text-sm text-text-secondary">
              Page {pagination.page || page} of{" "}
              {totalPages}
            </p>

            <div className="flex gap-2">

              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 1)
                  )
                }
                className="px-4 py-2 border border-border rounded-lg text-text-body hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= totalPages ||
                  isFetching
                }
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      current + 1,
                      totalPages
                    )
                  )
                }
                className="px-4 py-2 border border-border rounded-lg text-text-body hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>

            </div>

          </div>
        )}

      </div>

      {/* =========================
          VERIFICATION MODAL
      ========================= */}

      {selectedAttendance && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">

          <div className="bg-surface rounded-xl shadow-xl border border-border w-full max-w-lg">

            <div className="p-6 max-h-[90vh] overflow-y-auto">

              <h2 className="text-lg font-bold text-text-heading">
                Review Attendance
              </h2>

              <p className="text-text-secondary mt-1 text-sm">
                Verify this attendance record
              </p>

              {verificationError && (
                <div className="mt-4 p-3 rounded-lg bg-status-error-bg border border-status-error-text/20 flex items-start gap-2">
                  <FiAlertCircle className="text-status-error-text mt-0.5 shrink-0" />
                  <p className="text-status-error-text text-sm">
                    {verificationError}
                  </p>
                </div>
              )}

              {/* EMPLOYEE INFO */}

              <div className="bg-gray-100/70 border border-border rounded-lg p-4 mt-5 text-sm space-y-1.5">

                <p className="text-text-body">
                  <span className="font-semibold text-text-heading">
                    Employee:
                  </span>{" "}
                  {selectedAttendance.user?.name ||
                    "-"}
                </p>

                <p className="text-text-body">
                  <span className="font-semibold text-text-heading">
                    Employee ID:
                  </span>{" "}
                  {selectedAttendance.employee
                    ?.employeeId || "-"}
                </p>

                <p className="text-text-body">
                  <span className="font-semibold text-text-heading">
                    Punch In:
                  </span>{" "}
                  {formatDateTime(
                    selectedAttendance.checkIn
                  )}
                </p>

                <p className="text-text-body">
                  <span className="font-semibold text-text-heading">
                    Punch Out:
                  </span>{" "}
                  {formatDateTime(
                    selectedAttendance.checkOut
                  )}
                </p>

                <p className="text-text-body">
                  <span className="font-semibold text-text-heading">
                    Working:
                  </span>{" "}
                  {formatWorkingMinutes(
                    getDisplayWorkingMinutes(selectedAttendance)
                  )}
                </p>

              </div>

              {/* =========================
                  SELFIFS & LOCATIONS
              ========================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">

                {/* CHECK-IN */}
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-text-heading mb-3 text-sm">
                    Check-in Verification
                  </h3>

                  {selectedAttendance.checkInSelfie ? (
                    <img
                      src={selectedAttendance.checkInSelfie}
                      alt="Check-in selfie"
                      className="w-full h-48 object-cover rounded-lg border border-border"
                    />
                  ) : (
                    <div className="h-48 flex items-center justify-center bg-gray-100 rounded-lg text-sm text-text-secondary">
                      No check-in selfie
                    </div>
                  )}

                  <div className="mt-3 text-sm space-y-1">
                    <p className="text-text-body">
                      <span className="font-semibold text-text-heading">Latitude:</span>{" "}
                      {selectedAttendance.checkInLocation?.coordinates?.[1] ?? "-"}
                    </p>

                    <p className="text-text-body">
                      <span className="font-semibold text-text-heading">Longitude:</span>{" "}
                      {selectedAttendance.checkInLocation?.coordinates?.[0] ?? "-"}
                    </p>
                  </div>
                </div>

                {/* CHECK-OUT */}
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-text-heading mb-3 text-sm">
                    Check-out Verification
                  </h3>

                  {selectedAttendance.checkOutSelfie ? (
                    <img
                      src={selectedAttendance.checkOutSelfie}
                      alt="Check-out selfie"
                      className="w-full h-48 object-cover rounded-lg border border-border"
                    />
                  ) : (
                    <div className="h-48 flex items-center justify-center bg-gray-100 rounded-lg text-sm text-text-secondary">
                      No check-out selfie
                    </div>
                  )}

                  <div className="mt-3 text-sm space-y-1">
                    <p className="text-text-body">
                      <span className="font-semibold text-text-heading">Latitude:</span>{" "}
                      {selectedAttendance.checkOutLocation?.coordinates?.[1] ?? "-"}
                    </p>

                    <p className="text-text-body">
                      <span className="font-semibold text-text-heading">Longitude:</span>{" "}
                      {selectedAttendance.checkOutLocation?.coordinates?.[0] ?? "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* NOTE */}

              <div className="mt-5">

                <label className="block text-sm font-medium text-text-body mb-2">
                  Verification Note
                </label>

                <textarea
                  value={verificationNote}
                  onChange={(event) =>
                    setVerificationNote(
                      event.target.value
                    )
                  }
                  maxLength={500}
                  rows={4}
                  placeholder="Add verification remark..."
                  className="w-full border border-input-border rounded-lg px-3 py-2 text-text-body placeholder:text-text-disabled bg-surface resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
                />

                <p className="text-xs text-text-secondary mt-1">
                  {verificationNote.length}/500
                </p>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">

                <button
                  type="button"
                  disabled={verifying}
                  onClick={() => {
                    setSelectedAttendance(null);
                    setVerificationNote("");
                  }}
                  className="px-4 py-2 border border-border rounded-lg text-text-body hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={verifying}
                  onClick={() =>
                    handleVerification(
                      "rejected"
                    )
                  }
                  className="px-4 py-2 border border-status-error-text/30 text-status-error-text rounded-lg hover:bg-status-error-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying
                    ? "Processing..."
                    : "Reject"}
                </button>

                <button
                  type="button"
                  disabled={verifying}
                  onClick={() =>
                    handleVerification(
                      "approved"
                    )
                  }
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover active:bg-brand-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying
                    ? "Processing..."
                    : "Approve"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
};

export default AdminAttendancePage;