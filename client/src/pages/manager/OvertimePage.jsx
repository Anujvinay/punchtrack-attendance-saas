import { useState } from "react";
import {
  FiCheck,
  FiEye,
  FiX,
  FiClock,
  FiFilter,
} from "react-icons/fi";

import {
  useGetAllOvertimeQuery,
  useReviewOvertimeMutation,
} from "../../services/api";

const OvertimePage = () => {
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  const [selectedOvertime, setSelectedOvertime] =
    useState(null);

  const [reviewNote, setReviewNote] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetAllOvertimeQuery({
    page: 1,
    limit: 100,
    ...(status && { status }),
    ...(date && { date }),
  });

  const [
    reviewOvertime,
    { isLoading: isReviewing },
  ] = useReviewOvertimeMutation();

  const overtime =
    data?.data?.overtime || [];

  const formatDate = (value) => {
    if (!value) return "--";

    return new Date(value).toLocaleDateString();
  };

  const formatMinutes = (minutes) => {
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

  const getStatusClass = (value) => {
    switch (value) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "pending":
        return "bg-amber-100 text-amber-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const openReview = (overtimeRequest) => {
    setSelectedOvertime(overtimeRequest);
    setReviewNote("");
    setMessage("");
    setErrorMessage("");
  };

  const closeReview = () => {
    if (isReviewing) return;

    setSelectedOvertime(null);
    setReviewNote("");
  };

  const clearFilters = () => {
    setStatus("");
    setDate("");
    setMessage("");
    setErrorMessage("");
  };

  const handleReview = async (nextStatus) => {
    if (!selectedOvertime) {
      return;
    }

    setMessage("");
    setErrorMessage("");

    const trimmedNote = reviewNote.trim();

    if (trimmedNote.length > 500) {
      setErrorMessage(
        "Review note cannot exceed 500 characters."
      );
      return;
    }

    try {
      await reviewOvertime({
        id: selectedOvertime._id,
        status: nextStatus,
        reviewNote: trimmedNote,
      }).unwrap();

      setMessage(
        `Overtime request ${
          nextStatus === "approved"
            ? "approved"
            : "rejected"
        } successfully.`
      );

      closeReview();
    } catch (reviewError) {
      setErrorMessage(
        reviewError?.data?.message ||
          "Unable to review overtime request."
      );
    }
  };

  const hasActiveFilters = Boolean(status || date);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
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
              Review overtime requests from your team
            </p>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
          >
            {message}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {/* Filters */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700">
            <FiFilter className="text-slate-400" aria-hidden="true" />
            Filters
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

            <div>
              <label
                htmlFor="overtime-date"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Date
              </label>

              <input
                id="overtime-date"
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="overtime-status"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Status
              </label>

              <select
                id="overtime-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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

            <div className="flex items-end sm:col-span-2 md:col-span-1">
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters && !message && !errorMessage}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Filters
              </button>
            </div>

          </div>
        </section>

        {/* Overtime Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Overtime Requests
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {overtime.length} request
              {overtime.length !== 1 ? "s" : ""}
            </p>
          </div>

          {isLoading && (
            <div className="p-6 space-y-3" aria-live="polite">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg bg-slate-100 animate-pulse"
                />
              ))}
              <span className="sr-only">Loading overtime requests…</span>
            </div>
          )}

          {isError && (
            <div className="p-6">
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error?.data?.message ||
                  "Failed to load overtime requests."}
              </div>
            </div>
          )}

          {!isLoading &&
            !isError &&
            overtime.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-slate-500 text-sm">
                  No overtime requests found.
                </p>
              </div>
            )}

          {!isLoading &&
            !isError &&
            overtime.length > 0 && (
              <>
                {/* Desktop / tablet table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">

                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Employee
                        </th>

                        <th className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Employee ID
                        </th>

                        <th className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Date
                        </th>

                        <th className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Overtime
                        </th>

                        <th className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Reason
                        </th>

                        <th className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {overtime.map((item) => (
                        <tr
                          key={item._id}
                          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {item.user?.name ||
                                  "Unknown"}
                              </p>

                              <p className="text-sm text-slate-500">
                                {item.user?.email ||
                                  "--"}
                              </p>
                            </div>
                          </td>

                          <td className="p-4 text-sm text-slate-700">
                            {item.employee?.employeeId ||
                              "--"}
                          </td>

                          <td className="p-4 text-sm text-slate-700">
                            {formatDate(item.date)}
                          </td>

                          <td className="p-4 text-sm text-slate-700">
                            {formatMinutes(item.minutes)}
                          </td>

                          <td className="p-4 max-w-xs">
                            <span className="block truncate text-sm text-slate-700">
                              {item.reason || "--"}
                            </span>
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                item.status
                              )}`}
                            >
                              {item.status || "--"}
                            </span>
                          </td>

                          <td className="p-4">
                            {item.status === "pending" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openReview(item)
                                }
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                              >
                                <FiEye />
                                Review
                              </button>
                            ) : (
                              <span className="text-sm text-slate-500">
                                Reviewed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>

                {/* Mobile card list */}
                <ul className="md:hidden divide-y divide-slate-100">
                  {overtime.map((item) => (
                    <li key={item._id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {item.user?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
                            {item.user?.email || "--"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status || "--"}
                        </span>
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <div>
                          <dt className="text-xs text-slate-400">Employee ID</dt>
                          <dd className="text-slate-700">{item.employee?.employeeId || "--"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-400">Date</dt>
                          <dd className="text-slate-700">{formatDate(item.date)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-400">Overtime</dt>
                          <dd className="text-slate-700">{formatMinutes(item.minutes)}</dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="text-xs text-slate-400">Reason</dt>
                          <dd className="text-slate-700 truncate">{item.reason || "--"}</dd>
                        </div>
                      </dl>

                      <div className="mt-3">
                        {item.status === "pending" ? (
                          <button
                            type="button"
                            onClick={() => openReview(item)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors w-full justify-center"
                          >
                            <FiEye />
                            Review
                          </button>
                        ) : (
                          <span className="text-sm text-slate-500">Reviewed</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

        </section>
      </div>

      {/* Review Modal */}
      {selectedOvertime && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Review Overtime
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Review this overtime request
                </p>
              </div>

              <button
                type="button"
                onClick={closeReview}
                disabled={isReviewing}
                aria-label="Close review"
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none disabled:opacity-50 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 p-1"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Employee
                  </p>

                  <p className="font-medium text-slate-900 mt-1">
                    {selectedOvertime.user?.name ||
                      "Unknown"}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Employee ID
                  </p>

                  <p className="font-medium text-slate-900 mt-1">
                    {selectedOvertime.employee
                      ?.employeeId || "--"}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Date
                  </p>

                  <p className="font-medium text-slate-900 mt-1">
                    {formatDate(
                      selectedOvertime.date
                    )}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Overtime
                  </p>

                  <p className="font-medium text-slate-900 mt-1">
                    {formatMinutes(
                      selectedOvertime.minutes
                    )}
                  </p>
                </div>

              </div>

              <div className="mb-6">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Reason
                </p>

                <div className="mt-2 border border-slate-200 rounded-lg p-4 bg-slate-50 text-sm text-slate-700">
                  {selectedOvertime.reason || "--"}
                </div>
              </div>

              {selectedOvertime.attendance && (
                <div className="mb-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">
                    Working Hours
                  </p>

                  <div className="border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
                    {formatMinutes(
                      selectedOvertime.attendance
                        .workingMinutes
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label
                  htmlFor="review-note"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Review Note
                </label>

                <textarea
                  id="review-note"
                  value={reviewNote}
                  onChange={(event) =>
                    setReviewNote(event.target.value)
                  }
                  maxLength={500}
                  rows={4}
                  disabled={isReviewing}
                  placeholder="Add a review note..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-slate-100"
                />

                <p className="text-xs text-slate-500 text-right mt-1">
                  {reviewNote.length}/500
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    handleReview("rejected")
                  }
                  disabled={isReviewing}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  <FiX />

                  {isReviewing
                    ? "Processing..."
                    : "Reject"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleReview("approved")
                  }
                  disabled={isReviewing}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  <FiCheck />

                  {isReviewing
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

export default OvertimePage;