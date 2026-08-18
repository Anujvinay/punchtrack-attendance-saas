const { DateTime } = require("luxon");

const APP_TIMEZONE =
  process.env.APP_TIMEZONE || "Asia/Kolkata";

/**
 * Convert a business date to its UTC date-key.
 *
 * Example:
 * Asia/Kolkata → 12 Aug 2026
 * Stored key     → 2026-08-12T00:00:00.000Z
 */
const getBusinessDateKey = (value) => {
  const localDateTime =
    value instanceof Date
      ? DateTime.fromJSDate(value).setZone(APP_TIMEZONE)
      : DateTime.fromISO(String(value), {
          zone: APP_TIMEZONE,
        });

  if (!localDateTime.isValid) {
    throw new Error("Invalid business date");
  }

  return DateTime.utc(
    localDateTime.year,
    localDateTime.month,
    localDateTime.day
  ).startOf("day").toJSDate();
};

/**
 * Get a single business day's stored UTC date-key range.
 */
const getBusinessDayRange = (value = new Date()) => {
  const dateKey = getBusinessDateKey(value);

  const startOfDay = new Date(dateKey);

  const endOfDay = new Date(dateKey);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return {
    startOfDay,
    endOfDay,
  };
};

/**
 * Get stored UTC date-key range for a business-date range.
 *
 * Example:
 * 10 Aug → 12 Aug
 *
 * becomes:
 * 2026-08-10T00:00:00.000Z
 * →
 * 2026-08-12T23:59:59.999Z
 */
const getBusinessDateRange = (from, to) => {
  const fromKey = getBusinessDateKey(from);
  const toKey = getBusinessDateKey(to);

  if (fromKey > toKey) {
    throw new Error(
      "From date cannot be after to date"
    );
  }

  const startOfDay = new Date(fromKey);

  const endOfDay = new Date(toKey);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return {
    startOfDay,
    endOfDay,
  };
};

module.exports = {
  APP_TIMEZONE,
  getBusinessDateKey,
  getBusinessDayRange,
  getBusinessDateRange,
};