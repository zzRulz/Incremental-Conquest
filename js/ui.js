import { state, setState, on } from './state.js';

const goldEl = document.getElementById('gold');
const woodEl = document.getElementById('wood');
const stoneEl = document.getElementById('stone');
const wheatEl = document.getElementById('wheat');
const woodCapEl = document.getElementById('woodCap');
const stoneCapEl = document.getElementById('stoneCap');
const popEl = document.getElementById('pop');
const menuBtn = document.getElementById('menuBtn');
const adminBtn = document.getElementById('adminBtn');
const menuModal = document.getElementById('menuModal');
const menuBackdrop = document.getElementById('menuBackdrop');
const menuClose = document.getElementById('menuClose');
const resetBtn = document.getElementById('resetBtn');
const adminSection = document.getElementById('adminSection');
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
  // menu/admin
  menuBtn.addEventListener('click', ()=> menuModal.classList.add('open'));
  adminBtn.addEventListener('click', ()=>{ menuModal.classList.add('open'); setTimeout(()=> adminSection.scrollIntoView({behavior:'smooth'}), 50); });
  menuClose.addEventListener('click', ()=> menuModal.classList.remove('open'));
  menuBackdrop.addEventListener('click', ()=> menuModal.classList.remove('open'));
  resetBtn.addEventListener('click', ()=>{ if(confirm('Réinitialiser la partie ?')){ localStorage.removeItem('CONQ_CLICKER_V11'); location.reload(); }});

  addGoldBtn.addEventListener('click', ()=>{ const v=parseFloat(goldAmt.value)||0; setState({ gold: state.gold + v }); });
  addGold1k.addEventListener('click', ()=> setState({ gold: state.gold + 1000 }));
  addWoodBtn.addEventListener('click', ()=>{ const v=parseFloat(woodAmt.value)||0; setState({ wood: state.wood + v }); });
  addWood1k.addEventListener('click', ()=> setState({ wood: state.wood + 1000 }));
  addStoneBtn.addEventListener('click', ()=>{ const v=parseFloat(stoneAmt.value)||0; setState({ stone: state.stone + v }); });
  addStone1k.addEventListener('click', ()=> setState({ stone: state.stone + 1000 }));
  addWheatBtn.addEventListener('click', ()=>{ const v=parseFloat(wheatAmt.value)||0; setState({ wheat: state.wheat + v }); });
  addWheat1k.addEventListener('click', ()=> setState({ wheat: state.wheat + 1000 }));
  addPopBtn.addEventListener('click', ()=>{ const v=parseInt(popAmt.value)||0; setState({ pop: state.pop + v }); });

  on('state:changed', refreshHeader);
  refreshHeader(state);
}

export function refreshHeader(){
  goldEl.textContent = Math.round(state.gold*100)/100;
  woodEl.textContent = Math.floor(state.wood);
  stoneEl.textContent = Math.floor(state.stone);
  wheatEl.textContent = Math.round(state.wheat*100)/100;
  woodCapEl.textContent = state.woodCap;
  stoneCapEl.textContent = state.stoneCap;
  popEl.textContent = state.pop;
}
