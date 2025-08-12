import { state, setState, on } from './state.js';

const goldEl = document.getElementById('gold');
const woodEl = document.getElementById('wood');
const stoneEl = document.getElementById('stone');
const wheatEl = document.getElementById('wheat');
const woodCapEl = document.getElementById('woodCap');
const stoneCapEl = document.getElementById('stoneCap');
const popEl = document.getElementById('pop');
const incomeEl = document.getElementById('income');
const prestigeEl = document.getElementById('prestige');
const modeBtn = document.getElementById('modeBtn');
const soundBtn = document.getElementById('soundBtn');
const prestigeBtn = document.getElementById('prestigeBtn');
const menuBtn = document.getElementById('menuBtn');
const menuModal = document.getElementById('menuModal');
const menuBackdrop = document.getElementById('menuBackdrop');
const menuClose = document.getElementById('menuClose');
const resetBtn = document.getElementById('resetBtn');
const goldAmt = document.getElementById('goldAmt');
const addGoldBtn = document.getElementById('addGoldBtn');
const addGold1k = document.getElementById('addGold1k');
const woodAmt = document.getElementById('woodAmt');
const addWoodBtn = document.getElementById('addWoodBtn');
const addWood1k = document.getElementById('addWood1k');
const stoneAmt = document.getElementById('stoneAmt');
const addStoneBtn = document.getElementById('addStoneBtn');
const addStone1k = document.getElementById('addStone1k');
const wheatAmt = document.getElementById('wheatAmt');
const addWheatBtn = document.getElementById('addWheatBtn');
const addWheat1k = document.getElementById('addWheat1k');
const popAmt = document.getElementById('popAmt');
const addPopBtn = document.getElementById('addPopBtn');


export function initUI(){
  // Menu modal open/close
  if(menuBtn){ menuBtn.addEventListener('click', ()=> menuModal.classList.add('open')); }
  if(menuClose){ menuClose.addEventListener('click', ()=> menuModal.classList.remove('open')); }
  if(menuBackdrop){ menuBackdrop.addEventListener('click', ()=> menuModal.classList.remove('open')); }
  if(resetBtn){ resetBtn.addEventListener('click', ()=>{ if(confirm('Réinitialiser la partie ?')){ try{ localStorage.removeItem('CONQUETE_CLICKER_V1'); }catch(_){} location.reload(); } }); }
  // Admin adds
  if(addGoldBtn){ addGoldBtn.addEventListener('click', ()=>{ const v=parseFloat(goldAmt.value)||0; setState({ gold: state.gold + v }); }); }
  if(addGold1k){ addGold1k.addEventListener('click', ()=> setState({ gold: state.gold + 1000 })); }
  if(addWoodBtn){ addWoodBtn.addEventListener('click', ()=>{ const v=parseFloat(woodAmt.value)||0; setState({ wood: state.wood + v }); }); }
  if(addWood1k){ addWood1k.addEventListener('click', ()=> setState({ wood: state.wood + 1000 })); }
  if(addStoneBtn){ addStoneBtn.addEventListener('click', ()=>{ const v=parseFloat(stoneAmt.value)||0; setState({ stone: state.stone + v }); }); }
  if(addStone1k){ addStone1k.addEventListener('click', ()=> setState({ stone: state.stone + 1000 })); }
  if(addWheatBtn){ addWheatBtn.addEventListener('click', ()=>{ const v=parseFloat(wheatAmt.value)||0; setState({ wheat: state.wheat + v }); }); }
  if(addWheat1k){ addWheat1k.addEventListener('click', ()=> setState({ wheat: state.wheat + 1000 })); }
  if(addPopBtn){ addPopBtn.addEventListener('click', ()=>{ const v=parseInt(popAmt.value)||0; setState({ pop: state.pop + v }); }); }

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
  prestigeBtn.addEventListener('click', ()=>{});
  on('state:changed', refreshHeader);
  refreshHeader(state);
}
export function refreshHeader(){
  goldEl.textContent = Math.round(state.gold*100)/100;
  woodEl.textContent = Math.floor(state.wood);
  stoneEl.textContent = Math.floor(state.stone);
  woodCapEl.textContent = state.woodCap;
  stoneCapEl.textContent = state.stoneCap;
  wheatEl.textContent = Math.round(state.wheat*100)/100;
  popEl.textContent = state.pop;
  incomeEl.className = 'neu';
  incomeEl.textContent = 0;
}
