import { useEffect, useMemo, useState } from "react";
import {
  FiClock,
  FiLogIn,
  FiLogOut,
  FiCalendar,
} from "react-icons/fi";
import { useGetMyAttendanceQuery } from "../../services/api";
import AttendanceActions from "./AttendanceActions";

const AttendancePage = () => {
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
  } = useGetMyAttendanceQuery({
    page: 1,
    limit: 10,
  });

  const attendance = data?.data?.attendance || [];

  // ✅ Securely find today's attendance record instead of just taking the first one
  const today = useMemo(() => {
    if (!attendance.length) return undefined;

    const todayDateString = new Date().toDateString();
    return attendance.find(
      (item) => new Date(item.date).toDateString() === todayDateString
    );
  }, [attendance]);

  const formatTime = (value) => {
    if (!value) {
      return "--";
    }

    return new Date(value).toLocaleTimeString();
  };

  const formatWorkingMinutes = (minutes) => {
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

  const getDisplayWorkingMinutes = (record) => {
    if (!record) {
      return null;
    }

    // After checkout, use backend's final value.
    if (record.checkOut) {
      return record.workingMinutes ?? null;
    }

    // While checked in, calculate live elapsed time.
    if (record.checkIn) {
      const checkInTime = new Date(record.checkIn);

      if (Number.isNaN(checkInTime.getTime())) {
        return record.workingMinutes ?? null;
      }

      return Math.max(
        0,
        Math.floor(
          (currentTime.getTime() - checkInTime.getTime()) /
            60000
        )
      );
    }

    return record.workingMinutes ?? null;
  };

  const getShiftStatus = (minutes) => {
    if (
      minutes === undefined ||
      minutes === null
    ) {
      return {
        label: "Not completed",
        className:
          "bg-slate-100 text-slate-700",
      };
    }

    if (minutes >= 8 * 60) {
      return {
        label: "Completed",
        className:
          "bg-green-100 text-green-700",
      };
    }

    return {
      label: "Incomplete",
      className:
        "bg-amber-100 text-amber-700",
    };
  };

  const shiftStatus = getShiftStatus(
    getDisplayWorkingMinutes(today)
  );

  const getVerificationClass = (value) => {
    switch (value) {
      case "valid":
        return "bg-green-100 text-green-700";
      case "invalid":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const summaryCards = [
    {
      label: "Status",
      value: today?.status || "Not checked in",
      icon: FiClock,
    },
    {
      label: "Check In",
      value: formatTime(today?.checkIn),
      icon: FiLogIn,
    },
    {
      label: "Check Out",
      value: formatTime(today?.checkOut),
      icon: FiLogOut,
    },
    {
      label: "Working Hours",
      value: formatWorkingMinutes(
        getDisplayWorkingMinutes(today)
      ),
      icon: FiClock,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6 sm:mb-8 flex items-center gap-3">
          <span
            className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shrink-0"
            aria-hidden="true"
          >
            <FiCalendar className="text-lg" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Attendance
            </h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              Manage your daily attendance
            </p>
          </div>
        </div>

        {/* TODAY SUMMARY */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">

          {summaryCards.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5"
            >
              <div className="flex items-center gap-2 text-slate-500">
                <Icon className="text-sm shrink-0" aria-hidden="true" />
                <p className="text-xs sm:text-sm">{label}</p>
              </div>

              <h2 className="text-lg sm:text-2xl font-bold mt-2 text-slate-900 truncate">
                {value}
              </h2>
            </div>
          ))}

          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-slate-500">
              Shift Status
            </p>

            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${shiftStatus.className}`}
            >
              {shiftStatus.label}
            </span>
          </div>

        </section>

        {/* ATTENDANCE ACTIONS */}
        <AttendanceActions today={today} />

        {/* ATTENDANCE HISTORY */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mt-6">

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
            Attendance History
          </h2>

          {isLoading && (
            <div className="space-y-3" aria-live="polite">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg bg-slate-100 animate-pulse"
                />
              ))}
              <span className="sr-only">Loading attendance…</span>
            </div>
          )}

          {isError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load attendance.
            </div>
          )}

          {!isLoading &&
            !isError &&
            attendance.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-500 text-sm">
                  No attendance records found.
                </p>
              </div>
            )}

          {attendance.length > 0 && (
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
                        Check In
                      </th>

                      <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Check Out
                      </th>

                      <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Working
                      </th>

                      <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Verification
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendance.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-3 text-sm text-slate-700">
                          {item.date
                            ? new Date(
                                item.date
                              ).toLocaleDateString()
                            : "--"}
                        </td>

                        <td className="p-3 text-sm text-slate-700">
                          {formatTime(item.checkIn)}
                        </td>

                        <td className="p-3 text-sm text-slate-700">
                          {formatTime(item.checkOut)}
                        </td>

                        <td className="p-3 text-sm text-slate-700">
                          {formatWorkingMinutes(
                            getDisplayWorkingMinutes(item)
                          )}
                        </td>

                        <td className="p-3 text-sm text-slate-700 capitalize">
                          {item.status || "--"}
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getVerificationClass(
                              item.verificationStatus
                            )}`}
                          >
                            {item.verificationStatus || "pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

              {/* Mobile card list */}
              <ul className="md:hidden divide-y divide-slate-100">
                {attendance.map((item) => (
                  <li key={item._id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900 text-sm">
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : "--"}
                      </p>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getVerificationClass(
                          item.verificationStatus
                        )}`}
                      >
                        {item.verificationStatus || "pending"}
                      </span>
                    </div>

                    <dl className="mt-2 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                      <div>
                        <dt className="text-xs text-slate-400">Check In</dt>
                        <dd className="text-slate-700">{formatTime(item.checkIn)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">Check Out</dt>
                        <dd className="text-slate-700">{formatTime(item.checkOut)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">Working</dt>
                        <dd className="text-slate-700">
                          {formatWorkingMinutes(
                            getDisplayWorkingMinutes(item)
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">Status</dt>
                        <dd className="text-slate-700 capitalize">{item.status || "--"}</dd>
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

export default AttendancePage;