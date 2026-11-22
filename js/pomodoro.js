// Pomodoro timer. It is saved, so it keeps counting while you are on another page.
import { ALARM_MAX_LATE_MS, BREAK_SECONDS, MAX_FOCUS_MINUTES, MIN_FOCUS_MINUTES } from './config.js';
import { isAlarmSounding, playAlarm, stopAlarm, unlockAlarm } from './alarm.js';
import { $, showToast } from './helpers.js';
import { storage } from './storage.js';

// `endsAt` is a clock time, set only while the timer runs. Using the clock (not a counter)
// is what keeps the time correct after you leave the page and come back.
const pomodoro = {
  mode: 'focus',
  focusMinutes: MAX_FOCUS_MINUTES,
  secondsLeft: MAX_FOCUS_MINUTES * 60,
  endsAt: null,
  ...storage.load('pomodoro', {}),
};

const isRunning = () => pomodoro.endsAt !== null;
const getFocusSeconds = () => Math.min(MAX_FOCUS_MINUTES * 60, pomodoro.focusMinutes * 60 + (pomodoro.focusSeconds ?? 0));
// At the 25-minute maximum there is no room left for extra seconds.
const dropSecondsAtMaximum = () => { if (pomodoro.focusMinutes >= MAX_FOCUS_MINUTES) pomodoro.focusSeconds = 0; };
dropSecondsAtMaximum();
const getSecondsLeft = () => Math.ceil((pomodoro.endsAt - Date.now()) / 1000);
const savePomodoro = () => storage.save('pomodoro', pomodoro);

export function renderPomodoro() {
  const minutes = String(Math.floor(pomodoro.secondsLeft / 60)).padStart(2, '0');
  const seconds = String(pomodoro.secondsLeft % 60).padStart(2, '0');
  const isUntouched = pomodoro.mode === 'focus' && pomodoro.secondsLeft === getFocusSeconds() && !isRunning();
  $('#pomodoro-display').textContent = `${minutes}:${seconds}`;
  $('#pomodoro-mode').textContent = pomodoro.mode === 'focus' ? 'Focus' : 'Break';
  $('#pomodoro-toggle').textContent = isRunning() ? 'Pause' : 'Start';
  $('#pomodoro-reset').disabled = isUntouched;
  $('#pomodoro-minutes').value = pomodoro.focusMinutes;
  $('#pomodoro-minutes').disabled = isRunning();
  if ($('#pomodoro-alarm-stop')) $('#pomodoro-alarm-stop').hidden = !isAlarmSounding();
  if ($('#pomodoro-seconds')) {
    $('#pomodoro-seconds').value = String(pomodoro.focusSeconds ?? 0).padStart(2, '0');
    $('#pomodoro-seconds').disabled = isRunning();
  }
}

// Catches the timer up with the real clock, including phases that ended while you were away.
function syncWithClock() {
  let hasSwitched = false;
  let lastPhaseEndedAt = 0;
  while (getSecondsLeft() <= 0) {
    lastPhaseEndedAt = pomodoro.endsAt;
    pomodoro.mode = pomodoro.mode === 'focus' ? 'break' : 'focus';
    pomodoro.endsAt += (pomodoro.mode === 'focus' ? getFocusSeconds() : BREAK_SECONDS) * 1000;
    hasSwitched = true;
  }
  pomodoro.secondsLeft = getSecondsLeft();
  if (!hasSwitched) return;
  savePomodoro();
  // Only sound the alarm if the phase ended just now, not while you were away for a long time.
  if (Date.now() - lastPhaseEndedAt <= ALARM_MAX_LATE_MS) playAlarm(renderPomodoro);
  showToast(pomodoro.mode === 'break'
    ? `Focus session done. Take a ${BREAK_SECONDS / 60}-minute break.`
    : 'Break over. Time to focus.');
}

export function togglePomodoro() {
  unlockAlarm();
  stopAlarm();
  if (isRunning()) {
    syncWithClock();
    pomodoro.endsAt = null;
  } else {
    pomodoro.endsAt = Date.now() + pomodoro.secondsLeft * 1000;
  }
  savePomodoro();
  renderPomodoro();
}

export function resetPomodoro() {
  stopAlarm();
  Object.assign(pomodoro, { mode: 'focus', secondsLeft: getFocusSeconds(), endsAt: null });
  savePomodoro();
  renderPomodoro();
}

// Anything typed is kept between the minimum and the 25-minute maximum.
export function setFocusMinutes(enteredMinutes) {
  const wholeMinutes = Math.round(Number(enteredMinutes)) || MIN_FOCUS_MINUTES;
  pomodoro.focusMinutes = Math.min(MAX_FOCUS_MINUTES, Math.max(MIN_FOCUS_MINUTES, wholeMinutes));
  dropSecondsAtMaximum();
  if (pomodoro.mode === 'focus') pomodoro.secondsLeft = getFocusSeconds();
  savePomodoro();
  renderPomodoro();
}

// Call once when the page opens: picks the timer up where it left off, then ticks every second.
export function startPomodoro() {
  // If the timer was already running when the page opened, sound needs one click or key press to unlock.
  ['pointerdown', 'keydown'].forEach(type => document.addEventListener(type, unlockAlarm, { once: true }));
  $('#pomodoro-alarm-stop')?.addEventListener('click', stopAlarm);
  if (isRunning()) syncWithClock();
  renderPomodoro();
  setInterval(() => {
    if (!isRunning()) return;
    syncWithClock();
    renderPomodoro();
  }, 1000);
}

export function setFocusSeconds(enteredSeconds) {
  const s = Math.round(Number(enteredSeconds)) || 0;
  pomodoro.focusSeconds = Math.min(59, Math.max(0, s));
  dropSecondsAtMaximum();
  if (pomodoro.mode === 'focus') pomodoro.secondsLeft = getFocusSeconds();
  savePomodoro();
  renderPomodoro();
}
