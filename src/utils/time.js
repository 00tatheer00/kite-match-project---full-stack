/**
 * "5 mins ago" style label. Pass `now` from state (e.g. refreshed on an interval) to keep
 * rendering pure; defaults to the current time for non-React callers.
 */
export function formatRelativeTime(isoString, now = Date.now()) {
  if (!isoString) return 'just now';
  const time = new Date(isoString).getTime();
  if (Number.isNaN(time)) return 'recently';
  const diffMins = Math.floor((now - time) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
