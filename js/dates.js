// Date utilities — all LOCAL-date based. Never use `new Date("YYYY-MM-DD")`
// directly anywhere else in the app (it parses as UTC and shifts the day
// near midnight in negative-UTC-offset timezones). Always go through
// parseDateStr/toDateStr here.

export function pad2(n) {
  return n < 10 ? "0" + n : "" + n;
}

export function toDateStr(d) {
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

export function todayStr() {
  return toDateStr(new Date());
}

export function parseDateStr(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysStr(str, n) {
  const d = parseDateStr(str);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

export function dowOf(str) {
  return parseDateStr(str).getDay(); // 0=Sun..6=Sat
}

export function compareDateStr(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function isFuture(str) {
  return compareDateStr(str, todayStr()) > 0;
}

export function formatFriendly(str) {
  const d = parseDateStr(str);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
