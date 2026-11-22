// Calendar page: month grid with priority dots. Selecting a day filters the task list below it.
import { $, toDateKey } from './helpers.js';
import { markCalendarChecked } from './gamification.js';
import { state } from './state.js';
import { setFilter, startPage } from './app.js';

function createCalendarDayHtml(date) {
  const dateKey = toDateKey(date);
  const dots = state.tasks
    .filter(task => !task.completed && toDateKey(task.deadline) === dateKey)
    .map(task => `<i class="dot priority-${task.priority}"></i>`)
    .join('');
  const isSelected = dateKey === state.filters.calendarDateKey ? 'selected' : '';
  const isToday = dateKey === toDateKey(Date.now()) ? 'today' : '';
  return `<button class="day ${isSelected} ${isToday}" data-date="${dateKey}">${date.getDate()}<span class="dots">${dots}</span></button>`;
}

function renderCalendar() {
  const year = state.calendarMonth.getFullYear();
  const month = state.calendarMonth.getMonth();
  const leadingBlanks = Array(new Date(year, month, 1).getDay()).fill('<span></span>');
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayCells = Array.from({ length: daysInMonth }, (_, index) => createCalendarDayHtml(new Date(year, month, index + 1)));
  $('#calendar-title').textContent = state.calendarMonth.toLocaleDateString([], { month: 'long', year: 'numeric' });
  $('#calendar-grid').innerHTML = [...leadingBlanks, ...dayCells].join('');
}

function renderTaskHeading() {
  const { calendarDateKey } = state.filters;
  const dayText = calendarDateKey && new Date(`${calendarDateKey}T00:00:00`)
    .toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  $('#calendar-task-heading').textContent = calendarDateKey ? `Tasks for ${dayText}` : 'All Tasks';
}

function changeCalendarMonth(monthOffset) {
  const { calendarMonth } = state;
  state.calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + monthOffset, 1);
  renderCalendar();
}

function handleCalendarDayClick(event) {
  const dayButton = event.target.closest('.day');
  if (!dayButton) return;
  const isAlreadySelected = state.filters.calendarDateKey === dayButton.dataset.date;
  setFilter('calendarDateKey', isAlreadySelected ? null : dayButton.dataset.date);
}

$('#calendar-grid').addEventListener('click', handleCalendarDayClick);
$('#calendar-prev').addEventListener('click', () => changeCalendarMonth(-1));
$('#calendar-next').addEventListener('click', () => changeCalendarMonth(1));

startPage(() => { renderCalendar(); renderTaskHeading(); });
markCalendarChecked();
