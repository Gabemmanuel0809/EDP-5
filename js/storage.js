// Saves to the browser; falls back to memory if localStorage is blocked.
const memoryFallback = {};

const storage = {
  load(key, fallbackValue) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallbackValue; }
    catch { return memoryFallback[key] ?? fallbackValue; }
  },
  save(key, value) {
    memoryFallback[key] = value;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* memory fallback is enough */ }
  },
};
