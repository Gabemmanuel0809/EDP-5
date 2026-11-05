// XP, levels and achievements.
function changeXp(amount) {
  const levelBefore = getLevel();
  state.xp = Math.max(0, state.xp + amount);
  if (getLevel() > levelBefore) showToast(`Level up! You are now level ${getLevel()}.`);
}

function unlockNewAchievements() {
  const stats = { completedTaskCount: state.tasks.filter(task => task.completed).length, level: getLevel() };
  ACHIEVEMENTS
    .filter(achievement => !state.unlockedAchievementIds.includes(achievement.id) && achievement.isUnlocked(stats))
    .forEach(achievement => {
      state.unlockedAchievementIds.push(achievement.id);
      showToast(`Achievement unlocked: ${achievement.title}`);
    });
}
