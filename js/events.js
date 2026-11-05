// All user input: clicks, typing, and keyboard shortcuts.
function handleTaskFormSubmit(event) {
  event.preventDefault();
  const deadline = new Date($('#task-deadline').value).getTime();
  if (deadline <= Date.now()) return showToast('Pick a deadline in the future.');
  addTask($('#task-title').value.trim(), deadline, $('#task-priority').value);
  event.target.reset();
}

function handleTaskListClick(event) {
  const actionButton = event.target.closest('button[data-action]');
  if (!actionButton) return;
  const taskId = Number(actionButton.closest('.task').dataset.id);
  if (actionButton.dataset.action === 'complete') completeTask(taskId);
  else deleteTask(taskId);
}

function handleCalendarDayClick(event) {
  const dayButton = event.target.closest('.day');
  if (!dayButton) return;
  const isAlreadySelected = state.filters.calendarDateKey === dayButton.dataset.date;
  updateFilter('calendarDateKey', isAlreadySelected ? null : dayButton.dataset.date);
}

function changeCalendarMonth(monthOffset) {
  const { calendarMonth } = state;
  state.calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + monthOffset, 1);
  renderCalendar();
}

function handleKeyboardShortcut(event) {
  if (event.key === 'Escape') return event.target.blur();
  const isTyping = ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName);
  if (isTyping || event.ctrlKey || event.metaKey || event.altKey) return;
  const shortcutTarget = SHORTCUT_TARGETS[event.key.toLowerCase()];
  if (shortcutTarget) { event.preventDefault(); $(shortcutTarget).focus(); }
}

function bindEvents() {
  $('#task-form').addEventListener('submit', handleTaskFormSubmit);
  $('#search-input').addEventListener('input', event => updateFilter('searchText', event.target.value.toLowerCase().trim()));
  $('#priority-filter').addEventListener('change', event => updateFilter('priority', event.target.value));
  $('#status-filter').addEventListener('change', event => updateFilter('status', event.target.value));
  $('#task-list').addEventListener('click', handleTaskListClick);
  $('#calendar-grid').addEventListener('click', handleCalendarDayClick);
  $('#calendar-prev').addEventListener('click', () => changeCalendarMonth(-1));
  $('#calendar-next').addEventListener('click', () => changeCalendarMonth(1));
  $('#pomodoro-toggle').addEventListener('click', togglePomodoro);
  $('#pomodoro-reset').addEventListener('click', resetPomodoro);
  document.addEventListener('keydown', handleKeyboardShortcut);
}
