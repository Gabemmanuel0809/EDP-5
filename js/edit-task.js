// The Edit task dialog. It is built the first time it is opened, so every page with a task list shares it.
import { MAX_TITLE_LENGTH } from './config.js';
import { $, readTaskFields, toLocalInputValue } from './helpers.js';
import { editTask } from './tasks.js';

const FIELDS = ['title', 'deadline', 'priority'];
let dialog;
let editedTaskId;
let afterSave;

function showErrors(errors) {
  FIELDS.forEach(field => {
    $(`#edit-${field}-error`).textContent = errors[field] ?? '';
    $(`#edit-${field}`).setAttribute('aria-invalid', field in errors);
  });
  const firstInvalidField = FIELDS.find(field => field in errors);
  if (firstInvalidField) $(`#edit-${firstInvalidField}`).focus();
}

function handleSubmit(event) {
  event.preventDefault();
  const errors = editTask(editedTaskId, readTaskFields('edit'));
  showErrors(errors);
  if (Object.keys(errors).length) return; // stay open so the person can fix it
  dialog.close();
  afterSave();
}

function buildDialog() {
  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="edit-task-dialog" aria-labelledby="edit-dialog-title">
      <form id="edit-task-form" novalidate>
        <h2 id="edit-dialog-title">Edit task</h2>
        <label>Task name
          <input id="edit-title" maxlength="${MAX_TITLE_LENGTH}" autocomplete="off">
          <small id="edit-title-error" class="field-error"></small>
        </label>
        <label>Deadline
          <input id="edit-deadline" type="datetime-local">
          <small id="edit-deadline-error" class="field-error"></small>
        </label>
        <label>Importance
          <select id="edit-priority">
            <option value="high">🔴 Important</option>
            <option value="medium">🟡 Moderate</option>
            <option value="low">🟢 Slight</option>
          </select>
          <small id="edit-priority-error" class="field-error"></small>
        </label>
        <div class="dialog-buttons">
          <button class="primary">Save changes</button>
          <button type="button" id="edit-cancel">Cancel</button>
        </div>
      </form>
    </dialog>`);
  dialog = $('#edit-task-dialog');
  $('#edit-task-form').addEventListener('submit', handleSubmit);
  $('#edit-cancel').addEventListener('click', () => dialog.close());
}

// `onSaved` runs after a successful save, so the page can redraw.
export function openEditDialog(task, onSaved) {
  if (!dialog) buildDialog();
  [editedTaskId, afterSave] = [task.id, onSaved];
  $('#edit-title').value = task.title;
  $('#edit-deadline').value = toLocalInputValue(task.deadline);
  $('#edit-priority').value = task.priority;
  showErrors({});
  dialog.showModal();
}
