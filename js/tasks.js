// Task data and rules. Nothing here draws the screen; pages redraw after calling these.
import { MAX_DEADLINE_YEARS, MAX_TITLE_LENGTH, XP_PENALTY_FOR_MISSED_DEADLINE, XP_REWARD_BY_PRIORITY } from './config.js';
import { showToast, toDateKey } from './helpers.js';
import { saveState, state } from './state.js';
import { changeXp, unlockNewAchievements } from './gamification.js';

// Returns a message for every invalid field, like { title: '...' }. An empty object means the task is valid.
// `currentDeadline` is the deadline a task already has when editing: leaving it unchanged is always allowed.
export function validateTask({ title, deadline, priority }, currentDeadline) {
  const errors = {};
  const latestDeadline = new Date().setFullYear(new Date().getFullYear() + MAX_DEADLINE_YEARS);
  if (!title) errors.title = "Task name can't be empty.";
  else if (title.length > MAX_TITLE_LENGTH) errors.title = `Task name can be at most ${MAX_TITLE_LENGTH} characters.`;
  if (!Object.keys(XP_REWARD_BY_PRIORITY).includes(priority)) errors.priority = 'Pick Important, Moderate or Slight.';
  if (Number.isNaN(deadline)) errors.deadline = 'Pick a valid deadline.';
  else if (deadline > latestDeadline) errors.deadline = `Deadline must be within ${MAX_DEADLINE_YEARS} years.`;
  else if (deadline !== currentDeadline && deadline <= Date.now()) errors.deadline = 'Pick a deadline in the future.';
  return errors;
}

// Both of these return the validation errors, so an empty object means the change was saved.
export function addTask(fields) {
  const errors = validateTask(fields);
  if (Object.keys(errors).length) return errors;
  const createdAt = Date.now();
  state.tasks.push({ id: createdAt, createdAt, ...fields, completed: false, penalized: false });
  saveState();
  return errors;
}

export function editTask(taskId, fields) {
  const task = state.tasks.find(({ id }) => id === taskId);
  if (!task || task.completed) return { title: 'Only unfinished tasks can be edited.' };
  const errors = validateTask(fields, task.deadline);
  if (Object.keys(errors).length) return errors;
  Object.assign(task, fields);
  saveState();
  return errors;
}

export function completeTask(taskId) {
  const task = state.tasks.find(({ id }) => id === taskId);
  if (!task || task.completed) return;
  Object.assign(task, { completed: true, completedAt: Date.now() });
  if (task.completedAt > task.deadline) {
    applyMissedDeadlinePenalty(task);
  } else {
    const reward = XP_REWARD_BY_PRIORITY[task.priority];
    changeXp(reward);
    showToast(`+${reward} XP`);
  }
  unlockNewAchievements();
  saveState();
}

export function deleteTask(taskId) {
  state.tasks = state.tasks.filter(({ id }) => id !== taskId);
  saveState();
}

// A task is penalized only once, whether the minute check or a late "Done" click gets there first.
function applyMissedDeadlinePenalty(task) {
  if (task.penalized) return showToast(`"${task.title}" finished late: no XP earned.`);
  task.penalized = true;
  changeXp(-XP_PENALTY_FOR_MISSED_DEADLINE);
  showToast(`Missed "${task.title}": -${XP_PENALTY_FOR_MISSED_DEADLINE} XP`);
}

// Runs every minute. Returns true if a task was penalized, so the page knows to redraw.
export function penalizeMissedDeadlines() {
  const missedTasks = state.tasks.filter(task => !task.completed && !task.penalized && task.deadline < Date.now());
  missedTasks.forEach(applyMissedDeadlinePenalty);
  if (missedTasks.length) {
    unlockNewAchievements();
    saveState();
  }
  return missedTasks.length > 0;
}

export function getVisibleTasks() {
  const { searchText, priority, status, calendarDateKey } = state.filters;
  return state.tasks
    .filter(task => task.title.toLowerCase().includes(searchText))
    .filter(task => priority === 'all' || task.priority === priority)
    .filter(task => status === 'all' || (status === 'done') === task.completed)
    .filter(task => !calendarDateKey || toDateKey(task.deadline) === calendarDateKey)
    .sort((first, second) => first.deadline - second.deadline);
}
