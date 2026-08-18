import { useMemo, useState } from "react";
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiInbox,
} from "react-icons/fi";

import {
  useGetMyAttendanceQuery,
  useGetMyOvertimeQuery,
  useCreateOvertimeRequestMutation,
} from "../../services/api";

const OvertimePage = () => {
  const [selectedAttendanceId, setSelectedAttendanceId] =
    useState("");

  const [reason, setReason] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  const [
    createOvertimeRequest,
    { isLoading: isCreating },
  ] = useCreateOvertimeRequestMutation();

  const attendance =
    attendanceData?.data?.attendance || [];

  const overtimeRequests =
    overtimeData?.data?.overtime || [];

  // ==========================================================
  // EXISTING OVERTIME REQUESTS
  // ==========================================================

  const requestedAttendanceIds = useMemo(() => {
    return new Set(
      overtimeRequests
        .map((item) => {
          if (!item.attendance) {
            return null;
          }

          return typeof item.attendance === "object"
            ? item.attendance._id
            : item.attendance;
        })
        .filter(Boolean)
    );
  }, [overtimeRequests]);

  // ==========================================================
  // ELIGIBLE ATTENDANCE
  //
  // Backend rule:
  // 8 hours = 480 minutes
  // Overtime = workingMinutes - 480
  // ==========================================================

  const eligibleAttendance = useMemo(() => {
    return attendance.filter((item) => {
      return (
        item.checkOut &&
        Number(item.workingMinutes) > 480 &&
        !requestedAttendanceIds.has(item._id)
      );
    });
  }, [
    attendance,
    requestedAttendanceIds,
  ]);

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (value) => {
    if (!value) {
      return "--";
    }

    return new Date(
      value
    ).toLocaleDateString();
  };

  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatTime = (value) => {
    if (!value) {
      return "--";
    }

    return new Date(
      value
    ).toLocaleTimeString();
  };

  // ==========================================================
  // FORMAT MINUTES
  // ==========================================================

  const formatMinutes = (minutes) => {
    if (
      minutes === undefined ||
      minutes === null
    ) {
      return "--";
    }

    const hours = Math.floor(
      minutes / 60
    );

    const remainingMinutes =
      minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  };

  // ==========================================================
  // REQUEST OVERTIME
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!selectedAttendanceId) {
      setErrorMessage(
        "Please select an attendance record."
      );

      return;
    }

    if (reason.length > 500) {
      setErrorMessage(
        "Reason cannot exceed 500 characters."
      );

      return;
    }

    try {
      await createOvertimeRequest({
        attendanceId:
          selectedAttendanceId,
        reason: reason.trim(),
      }).unwrap();

      setMessage(
        "Overtime request created successfully."
      );

      setSelectedAttendanceId("");
      setReason("");
    } catch (error) {
      console.error(
        "Create overtime request failed:",
        error
      );

      setErrorMessage(
        error?.data?.message ||
          "Unable to create overtime request."
      );
    }
  };

  // ==========================================================
  // STATUS BADGE
  // ==========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-6 sm:mb-8 flex items-center gap-3">
          <span
            className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shrink-0"
            aria-hidden="true"
          >
            <FiClock className="text-lg" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Overtime
            </h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              Request and track your overtime
            </p>
          </div>
        </div>

        {/* ================================================== */}
        {/* MESSAGES */}
        {/* ================================================== */}

        {message && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
          >
            <FiCheckCircle className="shrink-0" aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            <FiAlertCircle className="shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================================================== */}
        {/* REQUEST OVERTIME */}
        {/* ================================================== */}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">

          <div className="flex items-center gap-3 mb-2">
            <FiClock className="text-lg text-indigo-600" aria-hidden="true" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Request Overtime
            </h2>
          </div>

          <p className="text-slate-500 mb-6 text-sm">
            Select an attendance record where you
            worked more than 8 hours.
          </p>

          {attendanceLoading && (
            <div className="space-y-3" aria-live="polite">
              <div className="h-12 rounded-lg bg-slate-100 animate-pulse" />
              <span className="sr-only">Loading attendance records…</span>
            </div>
          )}

          {attendanceError && (
            <p role="alert" className="text-red-600 text-sm">
              Failed to load attendance records.
            </p>
          )}

          {!attendanceLoading &&
            !attendanceError &&
            eligibleAttendance.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-medium text-slate-900 text-sm">
                  No overtime available.
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  You need a completed attendance
                  record with more than 8 working
                  hours.
                </p>
              </div>
            )}

          {eligibleAttendance.length > 0 && (
            <form onSubmit={handleSubmit}>

              {/* ATTENDANCE SELECT */}
              <div className="mb-5">
                <label
                  htmlFor="attendance"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Attendance
                </label>

                <select
                  id="attendance"
                  value={selectedAttendanceId}
                  onChange={(event) =>
                    setSelectedAttendanceId(
                      event.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:opacity-70"
                  disabled={isCreating}
                >
                  <option value="">
                    Select attendance
                  </option>

                  {eligibleAttendance.map(
                    (item) => {
                      const overtimeMinutes =
                        Math.max(
                          Number(
                            item.workingMinutes
                          ) - 480,
                          0
                        );

                      return (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {formatDate(item.date)} —{" "}
                          Working{" "}
                          {formatMinutes(
                            item.workingMinutes
                          )}{" "}
                          — OT{" "}
                          {formatMinutes(
                            overtimeMinutes
                          )}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              {/* SELECTED ATTENDANCE DETAILS */}
              {selectedAttendanceId && (
                <div className="mb-5 rounded-xl bg-indigo-50/60 border border-indigo-100 p-4">

                  {(() => {
                    const selected =
                      eligibleAttendance.find(
                        (item) =>
                          item._id ===
                          selectedAttendanceId
                      );

                    if (!selected) {
                      return null;
                    }

                    const overtimeMinutes =
                      Math.max(
                        Number(
                          selected.workingMinutes
                        ) - 480,
                        0
                      );

                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Date
                          </p>

                          <p className="font-medium text-slate-900 mt-0.5">
                            {formatDate(
                              selected.date
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Check In
                          </p>

                          <p className="font-medium text-slate-900 mt-0.5">
                            {formatTime(
                              selected.checkIn
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Check Out
                          </p>

                          <p className="font-medium text-slate-900 mt-0.5">
                            {formatTime(
                              selected.checkOut
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Overtime
                          </p>

                          <p className="font-bold text-green-600 mt-0.5">
                            {formatMinutes(
                              overtimeMinutes
                            )}
                          </p>
                        </div>

                      </div>
                    );
                  })()}

                </div>
              )}

              {/* REASON */}
              <div className="mb-5">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Reason
                  <span className="text-slate-400 font-normal">
                    {" "}
                    (optional)
                  </span>
                </label>

                <textarea
                  id="reason"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  maxLength={500}
                  rows={4}
                  placeholder="Explain why you worked overtime..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-slate-100"
                  disabled={isCreating}
                />

                <p className="text-xs text-slate-500 mt-1 text-right">
                  {reason.length}/500
                </p>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={
                  isCreating ||
                  !selectedAttendanceId
                }
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating
                  ? "Submitting..."
                  : "Submit Overtime Request"}
              </button>

            </form>
          )}
        </section>

        {/* ================================================== */}
        {/* MY REQUESTS */}
        {/* ================================================== */}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">

          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            My Overtime Requests
          </h2>

          <p className="text-slate-500 mt-1 mb-6 text-sm">
            Track the status of your overtime requests.
          </p>

          {overtimeLoading && (
            <div className="space-y-3" aria-live="polite">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg bg-slate-100 animate-pulse"
                />
              ))}
              <span className="sr-only">Loading overtime requests…</span>
            </div>
          )}

          {overtimeError && (
            <p role="alert" className="text-red-600 text-sm">
              Failed to load overtime requests.
            </p>
          )}

          {!overtimeLoading &&
            !overtimeError &&
            overtimeRequests.length === 0 && (
              <div className="text-center py-10">
                <FiInbox className="mx-auto text-2xl text-slate-300 mb-2" aria-hidden="true" />
                <p className="text-slate-500 text-sm">
                  You have no overtime requests.
                </p>
              </div>
            )}

          {!overtimeLoading &&
            !overtimeError &&
            overtimeRequests.length > 0 && (
              <>
                {/* Desktop / tablet table */}
                <div className="hidden md:block overflow-x-auto">

                  <table className="w-full text-left">

                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Date
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Working
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Overtime
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Reason
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Review Note
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {overtimeRequests.map(
                        (item) => (
                          <tr
                            key={item._id}
                            className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                          >
                            <td className="p-3 text-sm text-slate-700">
                              {formatDate(
                                item.date
                              )}
                            </td>

                            <td className="p-3 text-sm text-slate-700">
                              {item.attendance
                                ? formatMinutes(
                                    item.attendance
                                      .workingMinutes
                                  )
                                : "--"}
                            </td>

                            <td className="p-3 text-sm font-medium text-slate-900">
                              {formatMinutes(
                                item.minutes
                              )}
                            </td>

                            <td className="p-3 max-w-xs text-sm text-slate-700 truncate">
                              {item.reason || "--"}
                            </td>

                            <td className="p-3">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                  item.status
                                )}`}
                              >
                                {item.status ||
                                  "pending"}
                              </span>
                            </td>

                            <td className="p-3 max-w-xs text-sm text-slate-700 truncate">
                              {item.reviewNote ||
                                "--"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                  </table>

                </div>

                {/* Mobile card list */}
                <ul className="md:hidden divide-y divide-slate-100">
                  {overtimeRequests.map((item) => (
                    <li key={item._id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-900 text-sm">
                          {formatDate(item.date)}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status || "pending"}
                        </span>
                      </div>

                      <dl className="mt-2 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <div>
                          <dt className="text-xs text-slate-400">Working</dt>
                          <dd className="text-slate-700">
                            {item.attendance
                              ? formatMinutes(item.attendance.workingMinutes)
                              : "--"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-400">Overtime</dt>
                          <dd className="text-slate-900 font-medium">
                            {formatMinutes(item.minutes)}
                          </dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="text-xs text-slate-400">Reason</dt>
                          <dd className="text-slate-700 truncate">{item.reason || "--"}</dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="text-xs text-slate-400">Review Note</dt>
                          <dd className="text-slate-700 truncate">{item.reviewNote || "--"}</dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              </>
            )}

        </section>
      </div>
    </main>
  );
};

export default OvertimePage;