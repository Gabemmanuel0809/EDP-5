// Every tweakable number and list lives here.
const XP_REWARD_BY_PRIORITY = { high: 30, medium: 20, low: 10 };
const XP_PENALTY_FOR_MISSED_DEADLINE = 10;
const XP_PER_LEVEL = 100;

const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
const ALERT_WINDOW_MS = 5 * ONE_HOUR_MS;

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

const SHORTCUT_TARGETS = { n: '#task-title', '/': '#search-input' };

const ACHIEVEMENTS = [
  { id: 'first-task', title: 'First step', description: 'Complete 1 task', isUnlocked: stats => stats.completedTaskCount >= 1 },
  { id: 'five-tasks', title: 'On a roll', description: 'Complete 5 tasks', isUnlocked: stats => stats.completedTaskCount >= 5 },
  { id: 'level-three', title: 'Rising star', description: 'Reach level 3', isUnlocked: stats => stats.level >= 3 },
  { id: 'level-five', title: 'Study master', description: 'Reach level 5', isUnlocked: stats => stats.level >= 5 },
];
