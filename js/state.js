// The single source of truth: events change it, rendering reads it.
import { XP_PER_LEVEL } from './config.js';
import { storage } from './storage.js';

export const state = {
  tasks: storage.load('tasks', []),
  xp: storage.load('xp', 0),
  unlockedAchievementIds: storage.load('achievements', []),
  daily: storage.load('daily', {}), // { dateKey, calendarChecked, claimedIds } for today
  filters: { searchText: '', priority: 'all', status: 'all', calendarDateKey: null },
  calendarMonth: new Date(),
};

export function saveState() {
  storage.save('tasks', state.tasks);
  storage.save('xp', state.xp);
  storage.save('achievements', state.unlockedAchievementIds);
  storage.save('daily', state.daily);
}

export const getLevel = () => Math.floor(state.xp / XP_PER_LEVEL) + 1;
