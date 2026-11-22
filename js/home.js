// Tasks page: add tasks, see the full list, run the Pomodoro timer and the daily challenges.
import { $, readTaskFields, showToast } from './helpers.js';
import { addTask } from './tasks.js';
import { claimChallenge } from './gamification.js';
import { renderDailyChallenges, tickDailyChallenges } from './render.js';
import { renderPage, startPage } from './app.js';
import { resetPomodoro, setFocusMinutes, setFocusSeconds, startPomodoro, togglePomodoro } from './pomodoro.js';

const resetDialog = $('#reset-confirm-dialog');

function handleTaskFormSubmit(event) {
  event.preventDefault();
  const [firstError] = Object.values(addTask(readTaskFields('task')));
  if (firstError) return showToast(firstError);
  renderPage();
  event.target.reset();
}

function handleChallengeClick(event) {
  const { challenge } = event.target.dataset;
  if (!challenge) return;
  claimChallenge(challenge);
  renderPage();
}

$('#task-form').addEventListener('submit', handleTaskFormSubmit);
$('#daily-list').addEventListener('click', handleChallengeClick);
$('#pomodoro-toggle').addEventListener('click', togglePomodoro);
$('#pomodoro-minutes').addEventListener('change', event => setFocusMinutes(event.target.value));
$('#pomodoro-seconds').addEventListener('change', event => setFocusSeconds(event.target.value));
$('#pomodoro-reset').addEventListener('click', () => resetDialog.showModal());
$('#reset-confirm-yes').addEventListener('click', () => { resetDialog.close(); resetPomodoro(); });
$('#reset-confirm-no').addEventListener('click', () => resetDialog.close());

startPage(renderDailyChallenges);
startPomodoro();
setInterval(tickDailyChallenges, 1000);
