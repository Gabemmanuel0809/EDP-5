// Shared start-up for every app page. Each page calls startPage() once, at the end.
import { ONE_HOUR_MS, ONE_MINUTE_MS, SHORTCUTS } from './config.js';
import { $ } from './helpers.js';
import { state } from './state.js';
import { completeTask, deleteTask, penalizeMissedDeadlines } from './tasks.js';
import { renderPlayerStats, renderTaskList, runDeadlineAlerts, updateCountdowns } from './render.js';
import { openEditDialog } from './edit-task.js';

let renderPageExtras = () => {};

// Redraws the whole page. Call it after any change to the data.
export function renderPage() {
  renderPlayerStats();
  renderTaskList();
  runDeadlineAlerts();
  renderPageExtras();
}

export function setFilter(filterName, filterValue) {
  state.filters[filterName] = filterValue;
  renderPage();
}

let taskIdToDelete;

const taskActions = {
  complete: taskId => { completeTask(taskId); renderPage(); },
  edit: taskId => openEditDialog(state.tasks.find(({ id }) => id === taskId), renderPage),
  delete: taskId => { taskIdToDelete = taskId; $('#delete-confirm-dialog').showModal(); },
};

function handleTaskListClick(event) {
  const actionButton = event.target.closest('button[data-action]');
  if (!actionButton) return;
  taskActions[actionButton.dataset.action](Number(actionButton.closest('.task').dataset.id));
}

// Listeners are added once for the page, so closing the dialog with Esc leaves nothing behind.
function setupDeleteDialog() {
  const dialog = $('#delete-confirm-dialog');
  $('#delete-confirm-yes').addEventListener('click', () => { deleteTask(taskIdToDelete); renderPage(); dialog.close(); });
  $('#delete-confirm-no').addEventListener('click', () => dialog.close());
}

function handleKeyboardShortcut(event) {
  if (event.key === 'Escape') return event.target.blur();
  const isTyping = ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName);
  const shortcut = SHORTCUTS[event.key.toLowerCase()];
  if (!shortcut || isTyping || event.ctrlKey || event.metaKey || event.altKey) return;
  event.preventDefault();
  const field = $(shortcut.fieldSelector);
  if (field) field.focus();
  else location.href = shortcut.page;
}

function checkMissedDeadlines() {
  if (penalizeMissedDeadlines()) renderPage();
}

// `extras` draws whatever is unique to the page (calendar, achievements, ...).
export function startPage(extras = () => {}) {
  renderPageExtras = extras;
  if ($('#task-list')) {
    $('#task-list').addEventListener('click', handleTaskListClick);
    setupDeleteDialog();
  }
  document.addEventListener('keydown', handleKeyboardShortcut);
  if (location.hash === '#focus') $('#task-title, #search-input')?.focus();

  renderPage();
  checkMissedDeadlines();
  setInterval(updateCountdowns, 1000);
  setInterval(checkMissedDeadlines, ONE_MINUTE_MS);
  setInterval(runDeadlineAlerts, ONE_HOUR_MS);
}
