// Draws the parts of the screen that more than one page uses.
import { ACHIEVEMENTS, ALERT_WINDOW_MS, XP_PER_LEVEL } from './config.js';
import { $, escapeHtml, formatTimeLeft, toDateKey } from './helpers.js';
import { getChallengeStatuses } from './gamification.js';
import { getLevel, state } from './state.js';
import { getVisibleTasks } from './tasks.js';

function createTaskHtml(task) {
  const deadlineText = new Date(task.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  const statusHtml = task.completed ? '<span>Completed</span>' : '<span class="countdown"></span>';
  const pendingButtons = task.completed ? '' : `
        <button data-action="complete">Done</button>
        <button data-action="edit" aria-label="Edit task">✎</button>`;
  return `
    <li class="task priority-${task.priority} ${task.completed ? 'completed' : ''}"
        data-id="${task.id}" data-created="${task.createdAt}" data-deadline="${task.deadline}">
      <div><strong>${escapeHtml(task.title)}</strong><small>${deadlineText}</small></div>
      ${statusHtml}
      <div class="task-actions">${pendingButtons}
        <button data-action="delete" aria-label="Delete task">✕</button>
      </div>
    </li>`;
}

export function updateCountdowns() {
  const now = Date.now();
  document.querySelectorAll('.task:not(.completed)').forEach(taskElement => {
    const { created, deadline } = taskElement.dataset;
    const msLeft = deadline - now;
    const countdown = taskElement.querySelector('.countdown');
    countdown.textContent = formatTimeLeft(msLeft);
    countdown.classList.toggle('urgent', msLeft <= ALERT_WINDOW_MS);
    taskElement.style.setProperty('--elapsed', `${Math.min(100, ((now - created) / (deadline - created)) * 100)}%`);
  });
}

export function renderTaskList() {
  if (!$('#task-list')) return; // pages without a task list, such as Achievements
  const visibleTasks = getVisibleTasks();
  $('#task-list').innerHTML = visibleTasks.length
    ? visibleTasks.map(createTaskHtml).join('')
    : '<li class="empty">No tasks to show.</li>';
  updateCountdowns();
}

export function renderPlayerStats() {
  const xpIntoLevel = state.xp % XP_PER_LEVEL;
  $('#player-level').textContent = `Level ${getLevel()}`;
  $('#xp-progress').value = xpIntoLevel;
  $('#xp-text').textContent = `${xpIntoLevel} / ${XP_PER_LEVEL} XP`;
}

export function renderAchievements() {
  const unlockedIds = state.unlockedAchievementIds;
  const unlockedCount = ACHIEVEMENTS.filter(({ id }) => unlockedIds.includes(id)).length;
  $('#achievement-count').textContent = `${unlockedCount} / ${ACHIEVEMENTS.length} unlocked`;
  $('#achievement-progress').max = ACHIEVEMENTS.length;
  $('#achievement-progress').value = unlockedCount;
  $('#achievement-groups').innerHTML = [...new Set(ACHIEVEMENTS.map(({ group }) => group))].map(group => `
    <section class="achievement-group">
      <h3>${group}</h3>
      <ul>${ACHIEVEMENTS.filter(achievement => achievement.group === group).map(({ id, title, description }) => {
        const isUnlocked = unlockedIds.includes(id);
        return `<li class="achievement ${isUnlocked ? 'unlocked' : ''}">
          <div><strong>${title}</strong><small>${description}</small></div>
          <span class="achievement-status">${isUnlocked ? 'Unlocked ✓' : 'Locked'}</span>
        </li>`;
      }).join('')}</ul>
    </section>`).join('');
}

// Runs hourly (and on every redraw): warns about deadlines within 5 hours.
export function runDeadlineAlerts() {
  const now = Date.now();
  const tasksDueSoon = state.tasks.filter(task => !task.completed && task.deadline > now && task.deadline - now <= ALERT_WINDOW_MS);
  $('#alert-banner').hidden = !tasksDueSoon.length;
  $('#alert-banner').textContent = `Due within 5 hours: ${tasksDueSoon.map(task => task.title).join(', ')}`;
}

// ---- Daily challenges ----
let shownDateKey;
const getResetText = () => `Resets in ${formatTimeLeft(new Date().setHours(24, 0, 0, 0) - Date.now())}`;

export function renderDailyChallenges() {
  shownDateKey = toDateKey(Date.now());
  $('#daily-reset').textContent = getResetText();
  $('#daily-list').innerHTML = getChallengeStatuses().map(({ id, title, reward, status }) => `
    <li class="challenge ${status}">
      <div><strong>${title}</strong><small>+${reward} XP</small></div>
      <button data-challenge="${id}" ${status === 'ready' ? '' : 'disabled'}>${status === 'claimed' ? 'Claimed ✓' : 'Claim'}</button>
    </li>`).join('');
}

// Called every second: moves the reset countdown, and redraws the list once a new day starts.
export function tickDailyChallenges() {
  if (shownDateKey === toDateKey(Date.now())) $('#daily-reset').textContent = getResetText();
  else renderDailyChallenges();
}
