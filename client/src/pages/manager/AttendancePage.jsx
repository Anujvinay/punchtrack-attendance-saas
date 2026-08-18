import { useEffect, useState } from "react";

import {
  useGetAllAttendanceQuery,
  useVerifyAttendanceMutation,
} from "../../services/api";

import {
  FiCheck,
  FiX,
  FiEye,
  FiFilter,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

const AttendancePage = () => {
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");

  const [selectedAttendance, setSelectedAttendance] =
    useState(null);

  const [verificationNote, setVerificationNote] =
    useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    isError,
  } = useGetAllAttendanceQuery({
    page: 1,
    limit: 50,
    ...(date && { date }),
    ...(status && { status }),
  });

  const [
    verifyAttendance,
    { isLoading: isVerifying },
  ] = useVerifyAttendanceMutation();

  const attendance =
    data?.data?.attendance || [];

  // ==========================================================
  // FORMATTERS
  // ==========================================================

  const formatDate = (value) => {
    if (!value) return "--";

    return new Date(
      value
    ).toLocaleDateString();
  };

  const formatTime = (value) => {
    if (!value) return "--";

    return new Date(
      value
    ).toLocaleTimeString();
  };

  const formatMinutes = (minutes) => {
    if (
      minutes === undefined ||
      minutes === null
    ) {
      return "--";
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  };

  const isSameLocalDay = (dateA, dateB) => {
    if (!dateA || !dateB) {
      return false;
    }

    const a = new Date(dateA);
    const b = new Date(dateB);

    if (
      Number.isNaN(a.getTime()) ||
      Number.isNaN(b.getTime())
    ) {
      return false;
    }

    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const getDisplayWorkingMinutes = (record) => {
    // Final backend value after checkout.
    if (record?.checkOut) {
      return record?.workingMinutes ?? null;
    }

    // Live value only for today's open attendance.
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

    // Historical record with no checkout should not
    // keep counting from the current time.
    return record?.workingMinutes ?? null;
  };

  // ==========================================================
  // VERIFICATION
  // ==========================================================

  const openReview = (attendanceRecord) => {
    setSelectedAttendance(
      attendanceRecord
    );

    setVerificationNote("");
    setMessage("");
    setErrorMessage("");
  };

  const closeReview = () => {
    if (isVerifying) return;

    setSelectedAttendance(null);
    setVerificationNote("");
  };

  const handleVerification = async (
    verificationStatus
  ) => {
    if (!selectedAttendance) {
      return;
    }

    setMessage("");
    setErrorMessage("");

    if (verificationNote.length > 500) {
      setErrorMessage(
        "Verification note cannot exceed 500 characters."
      );

      return;
    }

    try {
      await verifyAttendance({
        id: selectedAttendance._id,
        verificationStatus,
        verificationNote:
          verificationNote.trim(),
      }).unwrap();

      setMessage(
        `Attendance ${verificationStatus} successfully.`
      );

      closeReview();
    } catch (error) {
      console.error(
        "Attendance verification failed:",
        error
      );

      setErrorMessage(
        error?.data?.message ||
          "Unable to update attendance verification."
      );
    }
  };

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setDate("");
    setStatus("");
  };

  // ==========================================================
  // STATUS BADGE
  // ==========================================================

  const getStatusClass = (value) => {
    switch (value) {
      case "approved":
      case "present":
        return "bg-status-success-bg text-status-success-text";

      case "rejected":
        return "bg-status-error-bg text-status-error-text";

      case "late":
      case "half-day":
      case "pending":
        return "bg-status-pending-bg text-status-pending-text";

      default:
        return "bg-status-neutral-bg text-status-neutral-text";
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight">
            Attendance
          </h1>

          <p className="text-text-secondary mt-1">
            View and verify employee attendance
          </p>
        </div>

        {/* ================================================== */}
        {/* MESSAGES */}
        {/* ================================================== */}

        {message && (
          <div className="mb-6 rounded-lg border border-status-success-text/20 bg-status-success-bg p-4 flex items-start gap-2">
            <FiCheckCircle className="text-status-success-text mt-0.5 shrink-0" />
            <p className="text-status-success-text text-sm">{message}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-status-error-text/20 bg-status-error-bg p-4 flex items-start gap-2">
            <FiAlertCircle className="text-status-error-text mt-0.5 shrink-0" />
            <p className="text-status-error-text text-sm">{errorMessage}</p>
          </div>
        )}

        {/* ================================================== */}
        {/* FILTERS */}
        {/* ================================================== */}

        <section className="bg-surface rounded-xl border border-border shadow-sm p-5 sm:p-6 mb-6">

          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-4">
            <FiFilter />
            <span>Filters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label
                htmlFor="attendance-date"
                className="block text-sm font-medium text-text-body mb-2"
              >
                Date
              </label>

              <input
                id="attendance-date"
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                className="w-full border border-input-border rounded-lg px-4 py-2.5 text-text-body bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="attendance-status"
                className="block text-sm font-medium text-text-body mb-2"
              >
                Status
              </label>

              <select
                id="attendance-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="w-full border border-input-border rounded-lg px-4 py-2.5 text-text-body bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
              >
                <option value="">
                  All statuses
                </option>

                <option value="present">
                  Present
                </option>

                <option value="late">
                  Late
                </option>

                <option value="half-day">
                  Half Day
                </option>

                <option value="absent">
                  Absent
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-text-body hover:bg-gray-100 transition-colors"
              >
                Clear Filters
              </button>
            </div>

          </div>
        </section>

        {/* ================================================== */}
        {/* TABLE */}
        {/* ================================================== */}

        <section className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">

          <div className="p-5 sm:p-6 border-b border-border">
            <h2 className="text-lg font-bold text-text-heading">
              Attendance Records
            </h2>

            <p className="text-text-secondary text-sm mt-1">
              Review employee attendance verification
            </p>
          </div>

          {isLoading && (
            <div className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-5 w-56 bg-gray-200 rounded" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
              </div>
            </div>
          )}

          {isError && (
            <div className="p-6">
              <p className="text-status-error-text text-sm">
                Failed to load attendance records.
              </p>
            </div>
          )}

          {!isLoading &&
            !isError &&
            attendance.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-text-secondary text-sm">
                  No attendance records found.
                </p>
              </div>
            )}

          {!isLoading &&
            !isError &&
            attendance.length > 0 && (
              <div className="overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>
                    <tr className="bg-gray-100/70 border-b border-border">

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
                        Check In
                      </th>

                      <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                        Check Out
                      </th>

                      <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                        Working
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

                    {attendance.map(
                      (item) => (
                        <tr
                          key={item._id}
                          className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                        >

                          <td className="p-4">
                            <div>
                              <p className="font-medium text-text-heading">
                                {item.user?.name ||
                                  "Unknown"}
                              </p>

                              <p className="text-sm text-text-secondary">
                                {item.user?.email ||
                                  "--"}
                              </p>
                            </div>
                          </td>

                          <td className="p-4 text-text-body whitespace-nowrap">
                            {item.employee
                              ?.employeeId ||
                              "--"}
                          </td>

                          <td className="p-4 text-text-body whitespace-nowrap">
                            {formatDate(
                              item.date
                            )}
                          </td>

                          <td className="p-4 text-text-body whitespace-nowrap">
                            {formatTime(
                              item.checkIn
                            )}
                          </td>

                          <td className="p-4 text-text-body whitespace-nowrap">
                            {formatTime(
                              item.checkOut
                            )}
                          </td>

                          <td className="p-4 text-text-body whitespace-nowrap">
                            {formatMinutes(
                              getDisplayWorkingMinutes(item)
                            )}
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusClass(
                                item.status
                              )}`}
                            >
                              {item.status ||
                                "--"}
                            </span>
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusClass(
                                item.verificationStatus
                              )}`}
                            >
                              {item.verificationStatus ||
                                "pending"}
                            </span>
                          </td>

                          <td className="p-4">

                            {item.verificationStatus ===
                              "pending" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openReview(item)
                                }
                                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm rounded-lg bg-brand-primary text-white hover:bg-brand-hover active:bg-brand-active transition-colors"
                              >
                                <FiEye className="text-sm" />
                                Review
                              </button>
                            ) : (
                              <span className="text-sm text-text-secondary">
                                Verified
                              </span>
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

      {/* ==================================================== */}
      {/* REVIEW MODAL */}
      {/* ==================================================== */}

      {selectedAttendance && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 flex items-center justify-center p-4">

          <div className="bg-surface rounded-xl shadow-xl border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}
            <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface">

              <div>
                <h2 className="text-lg font-bold text-text-heading">
                  Review Attendance
                </h2>

                <p className="text-sm text-text-secondary mt-1">
                  Verify this attendance record
                </p>
              </div>

              <button
                type="button"
                onClick={closeReview}
                disabled={isVerifying}
                className="text-text-secondary hover:text-text-heading text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ×
              </button>

            </div>

            {/* MODAL CONTENT */}
            <div className="p-5 sm:p-6">

              {/* EMPLOYEE INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                <div className="bg-gray-100/70 border border-border rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Employee
                  </p>

                  <p className="font-medium mt-1 text-text-heading">
                    {selectedAttendance.user?.name ||
                      "Unknown"}
                  </p>
                </div>

                <div className="bg-gray-100/70 border border-border rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Employee ID
                  </p>

                  <p className="font-medium mt-1 text-text-heading">
                    {selectedAttendance.employee
                      ?.employeeId || "--"}
                  </p>
                </div>

                <div className="bg-gray-100/70 border border-border rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Date
                  </p>

                  <p className="font-medium mt-1 text-text-heading">
                    {formatDate(
                      selectedAttendance.date
                    )}
                  </p>
                </div>

                <div className="bg-gray-100/70 border border-border rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Working Hours
                  </p>

                  <p className="font-medium mt-1 text-text-heading">
                    {formatMinutes(
                      getDisplayWorkingMinutes(selectedAttendance)
                    )}
                  </p>
                </div>

              </div>

              {/* TIME DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                <div className="border border-border rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Check In
                  </p>

                  <p className="font-medium mt-1 text-text-heading">
                    {formatTime(
                      selectedAttendance.checkIn
                    )}
                  </p>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Check Out
                  </p>

                  <p className="font-medium mt-1 text-text-heading">
                    {formatTime(
                      selectedAttendance.checkOut
                    )}
                  </p>
                </div>

              </div>

              {/* SELFIES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                <div>
                  <h3 className="font-medium text-text-heading mb-3 text-sm">
                    Check-in Selfie
                  </h3>

                  {selectedAttendance.checkInSelfie ? (
                    <img
                      src={
                        selectedAttendance.checkInSelfie
                      }
                      alt="Check-in selfie"
                      className="w-full max-h-80 object-contain rounded-lg border border-border bg-gray-100/70"
                    />
                  ) : (
                    <div className="border border-border rounded-lg p-8 text-center text-text-secondary text-sm">
                      No selfie available
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-text-heading mb-3 text-sm">
                    Check-out Selfie
                  </h3>

                  {selectedAttendance.checkOutSelfie ? (
                    <img
                      src={
                        selectedAttendance.checkOutSelfie
                      }
                      alt="Check-out selfie"
                      className="w-full max-h-80 object-contain rounded-lg border border-border bg-gray-100/70"
                    />
                  ) : (
                    <div className="border border-border rounded-lg p-8 text-center text-text-secondary text-sm">
                      No selfie available
                    </div>
                  )}
                </div>

              </div>

              {/* LOCATION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-medium text-text-heading text-sm">
                    Check-in Location
                  </h3>

                  {selectedAttendance.checkInLocation ? (
                    <p className="text-sm text-text-body mt-2">
                      Latitude:{" "}
                      {
                        selectedAttendance
                          .checkInLocation
                          .coordinates?.[1]
                      }
                      <br />
                      Longitude:{" "}
                      {
                        selectedAttendance
                          .checkInLocation
                          .coordinates?.[0]
                      }
                    </p>
                  ) : (
                    <p className="text-sm text-text-secondary mt-2">
                      No location available
                    </p>
                  )}
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-medium text-text-heading text-sm">
                    Check-out Location
                  </h3>

                  {selectedAttendance.checkOutLocation ? (
                    <p className="text-sm text-text-body mt-2">
                      Latitude:{" "}
                      {
                        selectedAttendance
                          .checkOutLocation
                          .coordinates?.[1]
                      }
                      <br />
                      Longitude:{" "}
                      {
                        selectedAttendance
                          .checkOutLocation
                          .coordinates?.[0]
                      }
                    </p>
                  ) : (
                    <p className="text-sm text-text-secondary mt-2">
                      No location available
                    </p>
                  )}
                </div>

              </div>

              {/* NOTE */}
              <div className="mb-6">

                <label
                  htmlFor="verification-note"
                  className="block text-sm font-medium text-text-body mb-2"
                >
                  Verification Note
                </label>

                <textarea
                  id="verification-note"
                  value={verificationNote}
                  onChange={(event) =>
                    setVerificationNote(
                      event.target.value
                    )
                  }
                  maxLength={500}
                  rows={4}
                  placeholder="Add a note about this verification..."
                  className="w-full border border-input-border rounded-lg px-4 py-3 text-text-body placeholder:text-text-disabled bg-surface resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors disabled:bg-gray-100 disabled:text-text-disabled disabled:cursor-not-allowed"
                  disabled={isVerifying}
                />

                <p className="text-xs text-text-secondary text-right mt-1">
                  {verificationNote.length}/500
                </p>

              </div>

              {/* ACTIONS */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    handleVerification(
                      "rejected"
                    )
                  }
                  disabled={isVerifying}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-status-error-text text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiX />

                  {isVerifying
                    ? "Processing..."
                    : "Reject"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleVerification(
                      "approved"
                    )
                  }
                  disabled={isVerifying}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-status-success-text text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCheck />

                  {isVerifying
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

export default AttendancePage;