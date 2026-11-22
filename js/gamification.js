// XP, levels, achievements and daily challenges.
import { ACHIEVEMENTS, DAILY_CHALLENGES } from './config.js';
import { showToast, toDateKey } from './helpers.js';
import { getLevel, saveState, state } from './state.js';

export function changeXp(amount) {
  const levelBefore = getLevel();
  state.xp = Math.max(0, state.xp + amount);
  if (getLevel() > levelBefore) showToast(`Level up! You are now level ${getLevel()}.`);
}

// The numbers achievements are judged on. A task counts as "missed" once it has been penalized.
function getAchievementStats() {
  const completed = state.tasks.filter(task => task.completed);
  const importantCompleted = completed.filter(task => task.priority === 'high');
  const missed = state.tasks.filter(task => task.penalized);
  const importantPerDay = {};
  importantCompleted.filter(task => task.completedAt).forEach(task => {
    const day = toDateKey(task.completedAt);
    importantPerDay[day] = (importantPerDay[day] ?? 0) + 1;
  });
  return {
    completedCount: completed.length,
    level: getLevel(),
    importantCompletedCount: importantCompleted.length,
    bestImportantDay: Math.max(0, ...Object.values(importantPerDay)),
    missedCount: missed.length,
    missedImportantCount: missed.filter(task => task.priority === 'high').length,
  };
}

export function unlockNewAchievements() {
  const stats = getAchievementStats();
  ACHIEVEMENTS
    .filter(achievement => !state.unlockedAchievementIds.includes(achievement.id) && achievement.isUnlocked(stats))
    .forEach(achievement => {
      state.unlockedAchievementIds.push(achievement.id);
      showToast(`Achievement unlocked: ${achievement.title}`);
    });
}

// Today's progress. When the date changes it starts fresh, which is the daily reset.
function getDailyProgress() {
  const today = toDateKey(Date.now());
  if (state.daily.dateKey !== today) state.daily = { dateKey: today, calendarChecked: false, claimedIds: [] };
  return state.daily;
}

// Each challenge is 'locked', 'ready' (the Claim button works) or 'claimed'.
export function getChallengeStatuses() {
  const { dateKey, calendarChecked, claimedIds } = getDailyProgress();
  const today = {
    completedTasks: state.tasks.filter(task => task.completed && toDateKey(task.completedAt) === dateKey),
    dueTasks: state.tasks.filter(task => toDateKey(task.deadline) === dateKey),
    calendarChecked,
  };
  return DAILY_CHALLENGES.map(challenge => ({
    ...challenge,
    status: claimedIds.includes(challenge.id) ? 'claimed' : challenge.isDone(today) ? 'ready' : 'locked',
  }));
}

export function claimChallenge(challengeId) {
  const challenge = getChallengeStatuses().find(({ id }) => id === challengeId);
  if (challenge?.status !== 'ready') return;
  getDailyProgress().claimedIds.push(challengeId);
  changeXp(challenge.reward);
  showToast(`Daily challenge claimed: +${challenge.reward} XP`);
  unlockNewAchievements();
  saveState();
}

export function markCalendarChecked() {
  const progress = getDailyProgress();
  if (progress.calendarChecked) return;
  progress.calendarChecked = true;
  saveState();
  showToast('Calendar checked! Claim your daily challenge on the Tasks page.');
}
