// Dashboard page: fills in the live stats from the saved data.
import { ACHIEVEMENTS } from './config.js';
import { $ } from './helpers.js';
import { getLevel, state } from './state.js';

const { tasks, xp, unlockedAchievementIds } = state;
const completedCount = tasks.filter(task => task.completed).length;
const completedPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0; // of ALL tasks

const stats = {
  'stat-completed': completedCount,
  'stat-pending': tasks.length - completedCount,
  'stat-overdue': tasks.filter(task => !task.completed && task.deadline < Date.now()).length,
  'stat-xp': `${xp} XP`,
  'stat-level': `Level ${getLevel()}`,
  'stat-achievements': `${unlockedAchievementIds.length} / ${ACHIEVEMENTS.length}`,
  'hero-pct': `${completedPercent}%`,
};
Object.entries(stats).forEach(([id, value]) => { $(`#${id}`).textContent = value; });

// Fill the progress ring (the circle has radius 54).
const ringLength = 2 * Math.PI * 54;
const ringCircle = $('.db-ring svg circle:last-child');
ringCircle.setAttribute('stroke-dasharray', ringLength.toFixed(1));
ringCircle.setAttribute('stroke-dashoffset', (ringLength * (1 - completedPercent / 100)).toFixed(1));
