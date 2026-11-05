// Task actions, time-based events, and search/filtering.
function addTask(title, deadline, priority) {
  const createdAt = Date.now();
  state.tasks.push({ id: createdAt, createdAt, title, deadline, priority, completed: false, penalized: false });
  saveState();
  renderAll();
}

function completeTask(taskId) {
  const task = state.tasks.find(candidate => candidate.id === taskId);
  if (!task || task.completed) return;
  task.completed = true;
  if (Date.now() > task.deadline) {
    applyMissedDeadlinePenalty(task);
  } else {
    changeXp(XP_REWARD_BY_PRIORITY[task.priority]);
    showToast(`+${XP_REWARD_BY_PRIORITY[task.priority]} XP`);
  }
  unlockNewAchievements();
  saveState();
  renderAll();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter(task => task.id !== taskId);
  saveState();
  renderAll();
}

// A task is penalized only once, whether the minute check or a late "Done" click gets there first.
function applyMissedDeadlinePenalty(task) {
  if (task.penalized) return showToast(`"${task.title}" finished late: no XP earned.`);
  task.penalized = true;
  changeXp(-XP_PENALTY_FOR_MISSED_DEADLINE);
  showToast(`Missed "${task.title}": -${XP_PENALTY_FOR_MISSED_DEADLINE} XP`);
}

// Runs every minute: late and unfinished means a one-time XP penalty.
function penalizeMissedDeadlines() {
  const now = Date.now();
  const missedTasks = state.tasks.filter(task => !task.completed && !task.penalized && task.deadline < now);
  missedTasks.forEach(applyMissedDeadlinePenalty);
  if (missedTasks.length) { saveState(); renderAll(); }
}

// Runs hourly (and on every change): warns about deadlines within 5 hours.
function runDeadlineAlerts() {
  const now = Date.now();
  const tasksDueSoon = state.tasks.filter(task => !task.completed && task.deadline > now && task.deadline - now <= ALERT_WINDOW_MS);
  $('#alert-banner').hidden = tasksDueSoon.length === 0;
  $('#alert-banner').textContent = `Due within 5 hours: ${tasksDueSoon.map(task => task.title).join(', ')}`;
}

function getVisibleTasks() {
  const { searchText, priority, status, calendarDateKey } = state.filters;
  return state.tasks
    .filter(task => task.title.toLowerCase().includes(searchText))
    .filter(task => priority === 'all' || task.priority === priority)
    .filter(task => status === 'all' || (status === 'done') === task.completed)
    .filter(task => !calendarDateKey || toDateKey(task.deadline) === calendarDateKey)
    .sort((first, second) => first.deadline - second.deadline);
}

function updateFilter(filterName, filterValue) {
  state.filters[filterName] = filterValue;
  renderTaskList();
  renderCalendar();
}
