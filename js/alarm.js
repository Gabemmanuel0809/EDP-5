// Disaster-style alarm for the Pomodoro timer. The sound is synthesized with the Web Audio API,
// so there is no audio file to load. Tweak ALARM_SECONDS / ALARM_VOLUME in config.js.
import { ALARM_SECONDS, ALARM_VOLUME } from './config.js';

const WAIL_LOW_HZ = 650;     // bottom of each siren sweep
const WAIL_HIGH_HZ = 1350;   // top of each siren sweep
const WAIL_SWEEP_SECONDS = 0.8;

let audioContext = null;
let stopTimerId = null;
let activeAlarm = null;      // { gain, oscillators } while the alarm is sounding

// Browsers only allow sound after the person has interacted with the page,
// so this must be called from a click or key press (see startPomodoro).
export function unlockAlarm() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext ??= new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
}

export const isAlarmSounding = () => activeAlarm !== null;

export function playAlarm(onStop = () => {}) {
  if (!audioContext || audioContext.state !== 'running') return false; // blocked or not unlocked yet
  stopAlarm();

  const start = audioContext.currentTime + 0.02;
  const end = start + ALARM_SECONDS;

  const gain = audioContext.createGain();
  const tone = audioContext.createBiquadFilter(); // takes the very harshest edge off
  tone.type = 'lowpass';
  tone.frequency.value = 3500;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(ALARM_VOLUME, start + 0.05);
  gain.gain.setValueAtTime(ALARM_VOLUME, end - 0.15);
  gain.gain.linearRampToValueAtTime(0, end);
  gain.connect(tone).connect(audioContext.destination);

  // Two slightly mismatched sawtooth waves make the wail rough and unsettling, like a real siren.
  const oscillators = [1, 1.02].map(detune => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(WAIL_LOW_HZ * detune, start);
    for (let t = 0, goingUp = true; t < ALARM_SECONDS; t += WAIL_SWEEP_SECONDS, goingUp = !goingUp) {
      const target = (goingUp ? WAIL_HIGH_HZ : WAIL_LOW_HZ) * detune;
      oscillator.frequency.exponentialRampToValueAtTime(target, start + t + WAIL_SWEEP_SECONDS);
    }
    oscillator.connect(gain);
    oscillator.start(start);
    oscillator.stop(end + 0.1);
    return oscillator;
  });

  activeAlarm = { gain, oscillators, onStop };
  stopTimerId = setTimeout(stopAlarm, (ALARM_SECONDS + 0.2) * 1000);
  return true;
}

export function stopAlarm() {
  if (!activeAlarm) return;
  const { gain, oscillators, onStop } = activeAlarm;
  activeAlarm = null;
  clearTimeout(stopTimerId);
  const now = audioContext.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.05); // quick fade so it doesn't click
  oscillators.forEach(oscillator => { try { oscillator.stop(now + 0.06); } catch { /* already stopped */ } });
  onStop();
}
