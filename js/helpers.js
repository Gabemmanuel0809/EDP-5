// Small reusable utilities.
export const $ = selector => document.querySelector(selector);

export const escapeHtml = text => text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

// YYYY-MM-DD in local time
export const toDateKey = timestamp => new Date(timestamp).toLocaleDateString('en-CA');

export function formatTimeLeft(msLeft) {
  if (msLeft <= 0) return 'Overdue';
  const totalSeconds = Math.floor(msLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return days ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m ${seconds}s`;
}

export function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  $('#toast-area').append(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Reads the title / deadline / priority fields whose ids start with `prefix` (task-title, edit-title, ...).
export const readTaskFields = prefix => ({
  title: $(`#${prefix}-title`).value.trim(),
  deadline: new Date($(`#${prefix}-deadline`).value).getTime(), // NaN when empty or invalid
  priority: $(`#${prefix}-priority`).value,
});

// A timestamp in the local-time format <input type="datetime-local"> expects.
export const toLocalInputValue = timestamp =>
  new Date(timestamp - new Date(timestamp).getTimezoneOffset() * 60000).toISOString().slice(0, 16);
