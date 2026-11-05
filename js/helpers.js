// Small reusable utilities.
const $ = selector => document.querySelector(selector);

const escapeHtml = text => text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

// YYYY-MM-DD in local time
const toDateKey = timestamp => new Date(timestamp).toLocaleDateString('en-CA');

function formatTimeLeft(msLeft) {
  if (msLeft <= 0) return 'Overdue';
  const totalSeconds = Math.floor(msLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return days ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m ${seconds}s`;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  $('#toast-area').append(toast);
  setTimeout(() => toast.remove(), 4000);
}
