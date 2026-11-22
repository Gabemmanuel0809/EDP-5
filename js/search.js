// Search page: the task list filters live as you type or change a dropdown.
import { $ } from './helpers.js';
import { setFilter, startPage } from './app.js';

$('#search-input').addEventListener('input', event => setFilter('searchText', event.target.value.toLowerCase().trim()));
$('#priority-filter').addEventListener('change', event => setFilter('priority', event.target.value));
$('#status-filter').addEventListener('change', event => setFilter('status', event.target.value));

startPage();
