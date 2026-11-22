// Achievements page: every achievement, grouped, with how many you have unlocked.
import { unlockNewAchievements } from './gamification.js';
import { saveState } from './state.js';
import { startPage } from './app.js';
import { renderAchievements } from './render.js';

unlockNewAchievements(); // picks up anything earned before the new achievements existed
saveState();
startPage(renderAchievements);
