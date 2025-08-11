import { state, setState, on } from './state.js';
const goldEl = document.getElementById('gold');
const woodEl = document.getElementById('wood');
const stoneEl = document.getElementById('stone');
const woodCapEl = document.getElementById('woodCap');
const stoneCapEl = document.getElementById('stoneCap');
const popEl = document.getElementById('pop');
const incomeEl = document.getElementById('income');
const prestigeEl = document.getElementById('prestige');
const modeBtn = document.getElementById('modeBtn');
const soundBtn = document.getElementById('soundBtn');
const prestigeBtn = document.getElementById('prestigeBtn');

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
  prestigeBtn.addEventListener('click', ()=>{ if(!prestigeBtn.disabled) window.gamePrestige(); });
  on('state:changed', refreshHeader);
  refreshHeader(state);
  updatePrestigeButton();
}
export function refreshHeader(){
  goldEl.textContent = Math.round(state.gold*100)/100;
  woodEl.textContent = Math.floor(state.wood);
  stoneEl.textContent = Math.floor(state.stone);
  woodCapEl.textContent = state.woodCap;
  stoneCapEl.textContent = state.stoneCap;
  popEl.textContent = state.pop;
  prestigeEl.textContent = state.prestige;
  const cls = state.incomePerTick>0 ? 'pos' : state.incomePerTick<0 ? 'neg' : 'neu';
  incomeEl.className = cls;
  incomeEl.textContent = Math.round(state.incomePerTick*100)/100;
  updatePrestigeButton();
}
export function updatePrestigeButton(){
  const can = state.castleBuilt && state.castleLevel>=10;
  prestigeBtn.disabled = !can;
}
