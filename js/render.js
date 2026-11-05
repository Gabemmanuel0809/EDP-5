// Draws the screen from `state`.
function createTaskHtml(task) {
  const deadlineText = new Date(task.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  return `
    <li class="task priority-${task.priority} ${task.completed ? 'completed' : ''}"
        data-id="${task.id}" data-created="${task.createdAt}" data-deadline="${task.deadline}">
      <div><strong>${escapeHtml(task.title)}</strong><small>${deadlineText}</small></div>
      ${task.completed ? '<span>Completed</span>' : '<span class="countdown"></span>'}
      ${task.completed ? '<span></span>' : '<button data-action="complete">Done</button>'}
      <button data-action="delete" aria-label="Delete task">✕</button>
    </li>`;
}

function updateCountdowns() {
  const now = Date.now();
  document.querySelectorAll('.task:not(.completed)').forEach(taskElement => {
    const { created, deadline } = taskElement.dataset;
    const msLeft = deadline - now;
    const elapsedPercent = Math.min(100, ((now - created) / (deadline - created)) * 100);
    const countdown = taskElement.querySelector('.countdown');
    countdown.textContent = formatTimeLeft(msLeft);
    countdown.classList.toggle('urgent', msLeft <= ALERT_WINDOW_MS);
    taskElement.style.setProperty('--elapsed', `${elapsedPercent}%`);
  });
}

function renderTaskList() {
  const visibleTasks = getVisibleTasks();
  $('#task-list').innerHTML = visibleTasks.length
    ? visibleTasks.map(createTaskHtml).join('')
    : '<li class="empty">No tasks to show. Press N to add one.</li>';
  updateCountdowns();
}

function createCalendarDayHtml(date) {
  const dateKey = toDateKey(date);
  const dots = state.tasks
    .filter(task => !task.completed && toDateKey(task.deadline) === dateKey)
    .map(task => `<i class="dot priority-${task.priority}"></i>`)
    .join('');
  const isSelected = dateKey === state.filters.calendarDateKey ? 'selected' : '';
  const isToday = dateKey === toDateKey(Date.now()) ? 'today' : '';
  return `<button class="day ${isSelected} ${isToday}" data-date="${dateKey}">${date.getDate()}<span class="dots">${dots}</span></button>`;
}

function renderCalendar() {
  const year = state.calendarMonth.getFullYear();
  const month = state.calendarMonth.getMonth();
  const leadingBlanks = Array(new Date(year, month, 1).getDay()).fill('<span></span>');
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayCells = Array.from({ length: daysInMonth }, (_, index) => createCalendarDayHtml(new Date(year, month, index + 1)));
  $('#calendar-title').textContent = state.calendarMonth.toLocaleDateString([], { month: 'long', year: 'numeric' });
  $('#calendar-grid').innerHTML = [...leadingBlanks, ...dayCells].join('');
}

function renderPlayerStats() {
  const xpIntoLevel = state.xp % XP_PER_LEVEL;
  $('#player-level').textContent = `Level ${getLevel()}`;
  $('#xp-progress').value = xpIntoLevel;
  $('#xp-text').textContent = `${xpIntoLevel} / ${XP_PER_LEVEL} XP`;
}

function renderAchievements() {
  $('#achievement-list').innerHTML = ACHIEVEMENTS.map(achievement => {
    const unlockedClass = state.unlockedAchievementIds.includes(achievement.id) ? 'unlocked' : '';
    return `<li class="${unlockedClass}">${achievement.title}: ${achievement.description}</li>`;
  }).join('');
}

function renderAll() {
  renderPlayerStats();
  renderTaskList();
  renderCalendar();
  renderAchievements();
  runDeadlineAlerts();
}
