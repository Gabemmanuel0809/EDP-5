// The single source of truth: events change it, rendering reads it.
const state = {
  tasks: storage.load('tasks', []),
  xp: storage.load('xp', 0),
  unlockedAchievementIds: storage.load('achievements', []),
  filters: { searchText: '', priority: 'all', status: 'all', calendarDateKey: null },
  calendarMonth: new Date(),
};

function saveState() {
  storage.save('tasks', state.tasks);
  storage.save('xp', state.xp);
  storage.save('achievements', state.unlockedAchievementIds);
}

const getLevel = () => Math.floor(state.xp / XP_PER_LEVEL) + 1;
