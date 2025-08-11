import { state } from './state.js';
export function beep(freq=880, dur=0.1){
  if (state.muted) return;
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type='square'; o.frequency.setValueAtTime(freq, ctx.currentTime);
  g.gain.setValueAtTime(0.05, ctx.currentTime);
  o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime+dur);
}
