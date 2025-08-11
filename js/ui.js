import { state, setState, on } from './state.js';
const goldEl = document.getElementById('gold');
const popEl = document.getElementById('pop');
const incomeEl = document.getElementById('income');
const modeBtn = document.getElementById('modeBtn');
const soundBtn = document.getElementById('soundBtn');
export function initUI(){
  modeBtn.textContent = `Mode: ${state.mode==='debug'?'Debug (2s)':'Normal (60s)'}`;
  soundBtn.textContent = state.muted ? '🔇 Son: OFF' : '🔊 Son: ON';
  modeBtn.addEventListener('click', ()=>{
    const newMode = state.mode==='debug' ? 'normal' : 'debug';
    setState({ mode: newMode });
    modeBtn.textContent = `Mode: ${newMode==='debug'?'Debug (2s)':'Normal (60s)'}`;
  });
  soundBtn.addEventListener('click', ()=>{
    const m = !state.muted; setState({ muted: m });
    soundBtn.textContent = m ? '🔇 Son: OFF' : '🔊 Son: ON';
  });
  on('state:changed', refreshHeader);
  refreshHeader(state);
}
export function refreshHeader(){
  goldEl.textContent = Math.round(state.gold*100)/100;
  popEl.textContent = state.pop;
  const cls = state.incomePerTick>0 ? 'pos' : state.incomePerTick<0 ? 'neg' : 'neu';
  incomeEl.className = cls;
  incomeEl.textContent = Math.round(state.incomePerTick*100)/100;
}
