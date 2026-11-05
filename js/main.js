// Entry point: wire everything up and start the timers.
bindEvents();
renderAll();
renderPomodoro();
penalizeMissedDeadlines();

setInterval(updateCountdowns, 1000);
setInterval(penalizeMissedDeadlines, ONE_MINUTE_MS);
setInterval(runDeadlineAlerts, ONE_HOUR_MS);
