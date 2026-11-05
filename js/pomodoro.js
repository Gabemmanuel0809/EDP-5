// Focus/break timer.
const pomodoro = { mode: 'focus', secondsLeft: FOCUS_SECONDS, timerId: null };

function renderPomodoro() {
  const minutes = String(Math.floor(pomodoro.secondsLeft / 60)).padStart(2, '0');
  const seconds = String(pomodoro.secondsLeft % 60).padStart(2, '0');
  $('#pomodoro-display').textContent = `${minutes}:${seconds}`;
  $('#pomodoro-mode').textContent = pomodoro.mode === 'focus' ? 'Focus' : 'Break';
  $('#pomodoro-toggle').textContent = pomodoro.timerId ? 'Pause' : 'Start';
}

function switchPomodoroMode() {
  const wasFocusing = pomodoro.mode === 'focus';
  pomodoro.mode = wasFocusing ? 'break' : 'focus';
  pomodoro.secondsLeft = wasFocusing ? BREAK_SECONDS : FOCUS_SECONDS;
  showToast(wasFocusing ? 'Focus session done. Take a 5-minute break.' : 'Break over. Time to focus.');
}

function tickPomodoro() {
  pomodoro.secondsLeft -= 1;
  if (pomodoro.secondsLeft <= 0) switchPomodoroMode();
  renderPomodoro();
}

function stopPomodoroTimer() {
  clearInterval(pomodoro.timerId);
  pomodoro.timerId = null;
}

function togglePomodoro() {
  if (pomodoro.timerId) stopPomodoroTimer();
  else pomodoro.timerId = setInterval(tickPomodoro, 1000);
  renderPomodoro();
}

function resetPomodoro() {
  stopPomodoroTimer();
  Object.assign(pomodoro, { mode: 'focus', secondsLeft: FOCUS_SECONDS });
  renderPomodoro();
}
