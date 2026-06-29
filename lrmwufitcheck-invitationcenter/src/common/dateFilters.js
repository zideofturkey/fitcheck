// LIB.dateFilters.js or similar
module.exports = {
  // Convert date string to start of day (00:00:00.000) in server timezone
  getStartOfDay(dateStr) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  },

  // Convert date string to end of day (23:59:59.999) in server timezone
  getEndOfDay(dateStr) {
    const d = new Date(dateStr);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  },

  // Convert date string to start of day in user's local timezone
  getStartOfDayLocal(dateStr, timezone) {
    const tz = timezone || "UTC";
    const d = new Date(dateStr);
    const localStr = d.toLocaleString("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [month, day, year] = localStr.split("/");
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    return localDate.toISOString();
  },

  // Convert date string to end of day in user's local timezone
  getEndOfDayLocal(dateStr, timezone) {
    const tz = timezone || "UTC";
    const d = new Date(dateStr);
    const localStr = d.toLocaleString("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [month, day, year] = localStr.split("/");
    const localDate = new Date(year, month - 1, day, 23, 59, 59, 999);
    return localDate.toISOString();
  },

  // Get start of today (00:00:00.000) in server timezone
  getStartOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  },

  // Get end of today (23:59:59.999) in server timezone
  getEndOfToday() {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  },

  // Get start of today in user's local timezone
  getStartOfTodayLocal(timezone) {
    const tz = timezone || "UTC";
    const now = new Date();
    const localStr = now.toLocaleString("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [month, day, year] = localStr.split("/");
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    return localDate.toISOString();
  },

  // Get end of today in user's local timezone
  getEndOfTodayLocal(timezone) {
    const tz = timezone || "UTC";
    const now = new Date();
    const localStr = now.toLocaleString("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [month, day, year] = localStr.split("/");
    const localDate = new Date(year, month - 1, day, 23, 59, 59, 999);
    return localDate.toISOString();
  },

  // Get start of this week (Monday 00:00:00.000) in server timezone
  getStartOfThisWeek() {
    const d = new Date();
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
  },

  // Get end of this week (Sunday 23:59:59.999) in server timezone
  getEndOfThisWeek() {
    const d = new Date();
    const day = d.getDay();
    const sunday = new Date(d);
    sunday.setDate(d.getDate() + (day === 0 ? 0 : 7 - day));
    sunday.setHours(23, 59, 59, 999);
    return sunday.toISOString();
  },

  // Get start of this week in user's local timezone
  getStartOfThisWeekLocal(timezone) {
    const tz = timezone || "UTC";
    const now = new Date();
    const localNow = new Date(now.toLocaleString("en-US", { timeZone: tz }));
    const day = localNow.getDay();
    const monday = new Date(localNow);
    monday.setDate(localNow.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
  },

  // Get end of this week in user's local timezone
  getEndOfThisWeekLocal(timezone) {
    const tz = timezone || "UTC";
    const now = new Date();
    const localNow = new Date(now.toLocaleString("en-US", { timeZone: tz }));
    const day = localNow.getDay();
    const sunday = new Date(localNow);
    sunday.setDate(localNow.getDate() + (day === 0 ? 0 : 7 - day));
    sunday.setHours(23, 59, 59, 999);
    return sunday.toISOString();
  },

  // Get start of this month (1st day 00:00:00.000) in server timezone
  getStartOfThisMonth() {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  },

  // Get end of this month (last day 23:59:59.999) in server timezone
  getEndOfThisMonth() {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  },
};
