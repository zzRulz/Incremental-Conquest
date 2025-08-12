import { CONFIG, bumpPatch } from './config.js';
import { state, setState, on } from './state.js';
import { save, load } from './save.js';

const goldEl = document.getElementById('gold'); const woodEl = document.getElementById('wood'); const stoneEl = document.getElementById('stone'); const wheatEl = document.getElementById('wheat'); const sciEl = document.getElementById('science');
const woodCapEl = document.getElementById('woodCap'); const stoneCapEl = document.getElementById('stoneCap'); const popEl = document.getElementById('pop');
const versionEl = document.getElementById('version');
const menuBtn = document.getElementById('menuBtn'); const adminBtn = document.getElementById('adminBtn');
const menuModal = document.getElementById('menuModal'); const menuBackdrop = document.getElementById('menuBackdrop'); const menuClose = document.getElementById('menuClose');
const resetBtn = document.getElementById('resetBtn'); const exportBtn = document.getElementById('exportBtn'); const importInput = document.getElementById('importInput'); const importBtn = document.getElementById('importBtn');
const adminSection = document.getElementById('adminSection');
const achBtn = document.getElementById('achBtn'); const achModal = document.getElementById('achModal'); const achBackdrop = document.getElementById('achBackdrop'); const achClose = document.getElementById('achClose');

// Admin inputs
const goldAmt = document.getElementById('goldAmt'); const addGoldBtn = document.getElementById('addGoldBtn'); const addGold10 = document.getElementById('addGold10'); const addGold100 = document.getElementById('addGold100'); const addGold1k = document.getElementById('addGold1k');
const woodAmt = document.getElementById('woodAmt'); const addWoodBtn = document.getElementById('addWoodBtn'); const addWood10 = document.getElementById('addWood10'); const addWood100 = document.getElementById('addWood100'); const addWood1k = document.getElementById('addWood1k');
const stoneAmt = document.getElementById('stoneAmt'); const addStoneBtn = document.getElementById('addStoneBtn'); const addStone10 = document.getElementById('addStone10'); const addStone100 = document.getElementById('addStone100'); const addStone1k = document.getElementById('addStone1k');
const wheatAmt = document.getElementById('wheatAmt'); const addWheatBtn = document.getElementById('addWheatBtn'); const addWheat10 = document.getElementById('addWheat10'); const addWheat100 = document.getElementById('addWheat100'); const addWheat1k = document.getElementById('addWheat1k');
const sciAmt = document.getElementById('scienceAmt'); const addScienceBtn = document.getElementById('addScienceBtn');
const popAmt = document.getElementById('popAmt'); const addPopBtn = document.getElementById('addPopBtn'); const bumpPatchBtn = document.getElementById('bumpPatch');

export function initUI(){
  versionEl.textContent = `v${state.version.major}.${state.version.minor}${state.version.suffix}`;

  menuBtn.addEventListener('click', ()=> menuModal.classList.add('open'));
  adminBtn.addEventListener('click', ()=>{ menuModal.classList.add('open'); setTimeout(()=> adminSection.scrollIntoView({behavior:'smooth'}), 50); });
  menuBackdrop.addEventListener('click', ()=> menuModal.classList.remove('open'));
  menuClose.addEventListener('click', ()=> menuModal.classList.remove('open'));
  resetBtn.addEventListener('click', ()=>{ if(confirm('Réinitialiser la partie ?')){ localStorage.removeItem(CONFIG.SAVE_KEY); location.reload(); }});
  exportBtn.addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(state)], {type:'application/json'}); const url = URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='save.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 1000);
  });
  importBtn.addEventListener('click', ()=>{
    const f = importInput.files && importInput.files[0]; if(!f) return;
    const reader = new FileReader(); reader.onload = (e)=>{ try{ const data = JSON.parse(e.target.result); Object.assign(state, data); save(); location.reload(); }catch(_){ alert('Import invalide'); } }; reader.readAsText(f);
  });

  const addX = (key, get)=>(()=>{ const v = parseFloat(get().value)||0; let patch={}; patch[key]=(state[key]||0)+v; setState(patch); });
  document.getElementById('addGoldBtn').addEventListener('click', addX('gold', ()=>goldAmt)); addGold10.addEventListener('click', ()=>setState({gold: state.gold+10})); addGold100.addEventListener('click', ()=>setState({gold: state.gold+100})); addGold1k.addEventListener('click', ()=>setState({gold: state.gold+1000}));
  document.getElementById('addWoodBtn').addEventListener('click', addX('wood', ()=>woodAmt)); addWood10.addEventListener('click', ()=>setState({wood: state.wood+10})); addWood100.addEventListener('click', ()=>setState({wood: state.wood+100})); addWood1k.addEventListener('click', ()=>setState({wood: state.wood+1000}));
  document.getElementById('addStoneBtn').addEventListener('click', addX('stone', ()=>stoneAmt)); addStone10.addEventListener('click', ()=>setState({stone: state.stone+10})); addStone100.addEventListener('click', ()=>setState({stone: state.stone+100})); addStone1k.addEventListener('click', ()=>setState({stone: state.stone+1000}));
  document.getElementById('addWheatBtn').addEventListener('click', addX('wheat', ()=>wheatAmt)); addWheat10.addEventListener('click', ()=>setState({wheat: state.wheat+10})); addWheat100.addEventListener('click', ()=>setState({wheat: state.wheat+100})); addWheat1k.addEventListener('click', ()=>setState({wheat: state.wheat+1000}));
  addScienceBtn.addEventListener('click', addX('science', ()=>sciAmt));
  addPopBtn.addEventListener('click', ()=>{ const v=parseInt(popAmt.value)||0; setState({pop: state.pop+v}); });
  bumpPatchBtn.addEventListener('click', ()=>{ bumpPatch(state.version); versionEl.textContent = `v${state.version.major}.${state.version.minor}${state.version.suffix}`; setState({version: state.version}); });

  on('state:changed', refreshHeader);
  refreshHeader(state);
}
export function refreshHeader(){
  goldEl.textContent = Math.round(state.gold*100)/100;
  woodEl.textContent = Math.floor(state.wood);
  stoneEl.textContent = Math.floor(state.stone);
  wheatEl.textContent = Math.round(state.wheat*100)/100;
  sciEl.textContent = Math.round(state.science*100)/100;
  woodCapEl.textContent = state.woodCap;
  stoneCapEl.textContent = state.stoneCap;
  popEl.textContent = state.pop;
}
