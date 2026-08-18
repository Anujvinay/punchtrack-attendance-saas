import { useState } from "react";
import {
  FiCheck,
  FiEye,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiFilter,
} from "react-icons/fi";

import {
  useGetAllOvertimeQuery,
  useReviewOvertimeMutation,
} from "../../services/api";

const AdminOvertimePage = () => {
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
    ...(status ? { status } : {}),
    ...(date ? { date } : {}),
  });

  const [
    reviewOvertime,
    { isLoading: isReviewing },
  ] = useReviewOvertimeMutation();

  const overtimeRequests =
    data?.data?.overtime || [];

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
        return "bg-status-success-bg text-status-success-text";

      case "rejected":
        return "bg-status-error-bg text-status-error-text";

      case "pending":
        return "bg-status-pending-bg text-status-pending-text";

      default:
        return "bg-status-neutral-bg text-status-neutral-text";
    }
  };

  const openReview = (request) => {
    setSelectedOvertime(request);
    setReviewNote(request.reviewNote || "");
    setMessage("");
    setErrorMessage("");
  };

  const closeReview = () => {
    if (isReviewing) {
      return;
    }

    setSelectedOvertime(null);
    setReviewNote("");
  };

  const clearFilters = () => {
    setDate("");
    setStatus("");
    setMessage("");
    setErrorMessage("");
  };

  const handleReview = async (nextStatus) => {
    if (!selectedOvertime) {
      return;
    }

    const trimmedNote = reviewNote.trim();

    if (trimmedNote.length > 500) {
      setErrorMessage(
        "Review note cannot exceed 500 characters."
      );
      return;
    }

    setMessage("");
    setErrorMessage("");

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
          "Failed to review overtime request."
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight">
            Overtime
          </h1>

          <p className="text-text-secondary mt-1">
            Review overtime requests across the system
          </p>
        </div>

        {/* Success */}
        {message && (
          <div className="mb-6 rounded-lg border border-status-success-text/20 bg-status-success-bg p-4 flex items-start gap-2">
            <FiCheckCircle className="text-status-success-text mt-0.5 shrink-0" />
            <p className="text-status-success-text text-sm">{message}</p>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-status-error-text/20 bg-status-error-bg p-4 flex items-start gap-2">
            <FiAlertCircle className="text-status-error-text mt-0.5 shrink-0" />
            <p className="text-status-error-text text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Filters */}
        <section className="bg-surface rounded-xl border border-border shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-medium mb-4">
            <FiFilter />
            <span>Filters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label
                htmlFor="admin-overtime-date"
                className="block text-sm font-medium text-text-body mb-2"
              >
                Date
              </label>

              <input
                id="admin-overtime-date"
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
                htmlFor="admin-overtime-status"
                className="block text-sm font-medium text-text-body mb-2"
              >
                Status
              </label>

              <select
                id="admin-overtime-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="w-full border border-input-border rounded-lg px-4 py-2.5 text-text-body bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors"
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

        {/* Table */}
        <section className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">

          <div className="p-5 sm:p-6 border-b border-border">
            <h2 className="text-lg font-bold text-text-heading">
              Overtime Requests
            </h2>

            <p className="text-sm text-text-secondary mt-1">
              {overtimeRequests.length} request
              {overtimeRequests.length !== 1
                ? "s"
                : ""}
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
              <div className="rounded-lg border border-status-error-text/20 bg-status-error-bg p-4 text-status-error-text text-sm">
                {error?.data?.message ||
                  "Failed to load overtime requests."}
              </div>
            </div>
          )}

          {!isLoading &&
            !isError &&
            overtimeRequests.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-text-secondary text-sm">
                  No overtime requests found.
                </p>
              </div>
            )}

          {!isLoading &&
            !isError &&
            overtimeRequests.length > 0 && (
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
                        Date
                      </th>

                      <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                        Overtime
                      </th>

                      <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                        Reason
                      </th>

                      <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                        Status
                      </th>

                      <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {overtimeRequests.map((request) => (
                      <tr
                        key={request._id}
                        className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-text-heading">
                              {request.user?.name ||
                                "Unknown"}
                            </p>

                            <p className="text-sm text-text-secondary">
                              {request.user?.email ||
                                "--"}
                            </p>
                          </div>
                        </td>

                        <td className="p-4 text-text-body whitespace-nowrap">
                          {request.employee?.employeeId ||
                            "--"}
                        </td>

                        <td className="p-4 text-text-body whitespace-nowrap">
                          {request.employee?.department ||
                            "--"}
                        </td>

                        <td className="p-4 text-text-body whitespace-nowrap">
                          {formatDate(request.date)}
                        </td>

                        <td className="p-4 text-text-body whitespace-nowrap">
                          {formatMinutes(request.minutes)}
                        </td>

                        <td className="p-4 max-w-xs">
                          <span className="block truncate text-text-body">
                            {request.reason || "--"}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusClass(
                              request.status
                            )}`}
                          >
                            {request.status || "--"}
                          </span>
                        </td>

                        <td className="p-4">
                          {request.status ===
                          "pending" ? (
                            <button
                              type="button"
                              onClick={() =>
                                openReview(request)
                              }
                              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm rounded-lg bg-brand-primary text-white hover:bg-brand-hover active:bg-brand-active transition-colors"
                            >
                              <FiEye className="text-sm" />
                              Review
                            </button>
                          ) : (
                            <span className="text-sm text-text-secondary">
                              Reviewed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}

        </section>
      </div>

      {/* Review Modal */}
      {selectedOvertime && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface">
              <div>
                <h2 className="text-lg font-bold text-text-heading">
                  Review Overtime
                </h2>

                <p className="text-sm text-text-secondary mt-1">
                  Review this overtime request
                </p>
              </div>

              <button
                type="button"
                onClick={closeReview}
                disabled={isReviewing}
                aria-label="Close review"
                className="text-text-secondary hover:text-text-heading text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-5 sm:p-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                <div className="bg-gray-100/70 border border-border rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Employee
                  </p>

                  <p className="font-medium mt-1 text-text-heading">
                    {selectedOvertime.user?.name ||
                      "Unknown"}
                  </p>
                </div>

                <div className="bg-gray-100/70 border border-border rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Employee ID
                  </p>

                  <p className="font-medium mt-1 text-text-heading">
                    {selectedOvertime.employee
                      ?.employeeId || "--"}
                  </p>
                </div>

                <div className="bg-gray-100/70 border border-border rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Department
                  </p>

                  <p className="font-medium mt-1 text-text-heading">
                    {selectedOvertime.employee
                      ?.department || "--"}
                  </p>
                </div>

                <div className="bg-gray-100/70 border border-border rounded-lg p-4">
                  <p className="text-sm text-text-secondary">
                    Overtime
                  </p>

                  <p className="font-medium mt-1 text-text-heading">
                    {formatMinutes(
                      selectedOvertime.minutes
                    )}
                  </p>
                </div>

                <div className="bg-gray-100/70 border border-border rounded-lg p-4 md:col-span-2">
                  <p className="text-sm text-text-secondary">
                    Date
                  </p>

                  <p className="font-medium mt-1 text-text-heading">
                    {formatDate(
                      selectedOvertime.date
                    )}
                  </p>
                </div>

              </div>

              <div className="mb-6">
                <p className="text-sm text-text-secondary">
                  Reason
                </p>

                <div className="mt-2 border border-border rounded-lg p-4 bg-gray-100/70 text-text-body text-sm">
                  {selectedOvertime.reason || "--"}
                </div>
              </div>

              {selectedOvertime.attendance && (
                <div className="mb-6">
                  <p className="text-sm text-text-secondary mb-2">
                    Working Hours
                  </p>

                  <div className="border border-border rounded-lg p-4 text-text-body text-sm">
                    {formatMinutes(
                      selectedOvertime.attendance
                        .workingMinutes
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label
                  htmlFor="admin-review-note"
                  className="block text-sm font-medium text-text-body mb-2"
                >
                  Review Note
                </label>

                <textarea
                  id="admin-review-note"
                  value={reviewNote}
                  onChange={(event) =>
                    setReviewNote(event.target.value)
                  }
                  disabled={isReviewing}
                  maxLength={500}
                  rows={4}
                  placeholder="Add a review note..."
                  className="w-full border border-input-border rounded-lg px-4 py-3 text-text-body placeholder:text-text-disabled bg-surface resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors disabled:bg-gray-100 disabled:text-text-disabled disabled:cursor-not-allowed"
                />

                <p className="text-xs text-text-secondary text-right mt-1">
                  {reviewNote.length}/500
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    handleReview("rejected")
                  }
                  disabled={isReviewing}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-status-error-text text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-status-success-text text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AdminOvertimePage;