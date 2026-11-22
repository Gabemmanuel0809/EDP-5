// Every tweakable number and list lives here.
export const XP_REWARD_BY_PRIORITY = { high: 30, medium: 20, low: 10 };
export const XP_PENALTY_FOR_MISSED_DEADLINE = 10;
export const XP_PER_LEVEL = 100;

export const ONE_MINUTE_MS = 60 * 1000;
export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
export const ALERT_WINDOW_MS = 5 * ONE_HOUR_MS;

// The focus length is editable up to the maximum, which is also the default. The break is fixed.
export const MIN_FOCUS_MINUTES = 1;
export const MAX_FOCUS_MINUTES = 25;
export const BREAK_SECONDS = 5 * 60;

// The alarm that sounds when a focus session or break ends. Volume goes from 0 (silent) to 1 (very loud).
export const ALARM_SECONDS = 8;
export const ALARM_VOLUME = 0.35;
// A phase that ended longer ago than this (you were away) is skipped silently instead of sounding late.
export const ALARM_MAX_LATE_MS = 90 * 1000;

// Pressing the key focuses the field on this page, or opens the page that has it.
export const SHORTCUTS = {
  n: { fieldSelector: '#task-title', page: './#focus' },
  '/': { fieldSelector: '#search-input', page: 'search.html#focus' },
};

// Each achievement is judged on the stats built in gamification.js. `group` sets its section on the Achievements page.
// Limits for task names and deadlines (see validateTask in tasks.js).
export const MAX_TITLE_LENGTH = 80;
export const MAX_DEADLINE_YEARS = 5;

export const ACHIEVEMENTS = [
  { id: 'first-task', group: 'Progress', title: 'First step', description: 'Complete 1 task', isUnlocked: stats => stats.completedCount >= 1 },
  { id: 'five-tasks', group: 'Progress', title: 'On a roll', description: 'Complete 5 tasks', isUnlocked: stats => stats.completedCount >= 5 },
  { id: 'ten-tasks', group: 'Progress', title: 'Task machine', description: 'Complete 10 tasks', isUnlocked: stats => stats.completedCount >= 10 },
  { id: 'twenty-five-tasks', group: 'Progress', title: 'Unstoppable', description: 'Complete 25 tasks', isUnlocked: stats => stats.completedCount >= 25 },
  { id: 'level-three', group: 'Progress', title: 'Rising star', description: 'Reach level 3', isUnlocked: stats => stats.level >= 3 },
  { id: 'level-five', group: 'Progress', title: 'Study master', description: 'Reach level 5', isUnlocked: stats => stats.level >= 5 },
  { id: 'level-ten', group: 'Progress', title: 'Legend', description: 'Reach level 10', isUnlocked: stats => stats.level >= 10 },

  { id: 'first-important', group: 'Important work', title: 'Top priority', description: 'Complete an important task', isUnlocked: stats => stats.importantCompletedCount >= 1 },
  { id: 'grind-three', group: 'Important work', title: 'Grind mode', description: 'Complete 3 important tasks in one day', isUnlocked: stats => stats.bestImportantDay >= 3 },

  { id: 'first-miss', group: 'Missed deadlines', title: 'Oops', description: 'Miss your first deadline', isUnlocked: stats => stats.missedCount >= 1 },
  { id: 'three-misses', group: 'Missed deadlines', title: 'Running late', description: 'Miss 3 deadlines', isUnlocked: stats => stats.missedCount >= 3 },
  { id: 'five-misses', group: 'Missed deadlines', title: 'Chronic procrastinator', description: 'Miss 5 deadlines', isUnlocked: stats => stats.missedCount >= 5 },
  { id: 'first-missed-important', group: 'Missed deadlines', title: 'Dropped the ball', description: 'Miss the deadline of an important task', isUnlocked: stats => stats.missedImportantCount >= 1 },
  { id: 'three-missed-important', group: 'Missed deadlines', title: 'Red alert', description: 'Miss 3 important deadlines', isUnlocked: stats => stats.missedImportantCount >= 3 },
];

// The same four challenges every day. `isDone` receives today's stats (see gamification.js).
export const DAILY_CHALLENGES = [
  { id: 'any-task', title: 'Complete a single task today', reward: 15, isDone: today => today.completedTasks.length > 0 },
  { id: 'important-task', title: 'Complete a single important task today', reward: 25, isDone: today => today.completedTasks.some(task => task.priority === 'high') },
  { id: 'all-tasks', title: 'Complete all tasks today', reward: 50, isDone: today => today.dueTasks.length > 0 && today.dueTasks.every(task => task.completed) },
  { id: 'check-calendar', title: 'Check the calendar today', reward: 3, isDone: today => today.calendarChecked },
];
