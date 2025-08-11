import { CONFIG } from './config.js';
import { state, setState } from './state.js';
import { getCenterCell, idx, occupy, getRandomFreeCell, placeEmoji } from './grid.js';
import { beep } from './sound.js';
import { recalcIncome } from './economy.js';
import { upsertCastleCard, upsertHousesCard } from './panel.js';

const castleHead = document.getElementById('castleHead');
const castleDesc = document.getElementById('castleDesc');
const houseLimitLabel = document.getElementById('houseLimitLabel');
const castleFill = document.getElementById('castleFill');
const buildCastleBtn = document.getElementById('buildCastleBtn');
const castleMsg = document.getElementById('castleMsg');
const castleActions = document.getElementById('castleActions');

const houseCard = document.getElementById('houseCard');
const buildHouseBtn = document.getElementById('buildHouseBtn');
const houseFill = document.getElementById('houseFill');
const houseMsg = document.getElementById('houseMsg');

export function initBuildings(){
  // buttons
  buildCastleBtn.addEventListener('click', buildCastle);
  buildHouseBtn.addEventListener('click', buildHouse);
  // restore UI if loaded
  if (state.castleBuilt){
    const center = getCenterCell();
    center.classList.remove('glow');
    center.classList.add('chateau'); center.textContent='🏰';
    toUpgradeUI();
    houseCard.style.display = '';
  }
  updateLabels();
  recalcIncome();
  upsertCastleCard();
  if (state.houses>0) upsertHousesCard();
}

function updateLabels(){
  castleHead.textContent = `🏰 Château (Niv. ${state.castleLevel})`;
  castleDesc.innerHTML = `Prod: <b>+${state.castleLevel} or/tick</b> • Limite maisons: <b id="houseLimitLabel">${state.castleLevel}</b>`;
}

function buildCastle(){
  if (state.castleBuilt) return;
  castleFill.style.transition='none'; castleFill.style.width='0%';
  requestAnimationFrame(()=>{ castleFill.style.transition='width 10s linear'; castleFill.style.width='100%'; });
  buildCastleBtn.disabled = true; castleMsg.textContent = 'Construction… (10s)';
  setTimeout(()=>{
    const center = getCenterCell();
    center.classList.remove('glow');
    center.classList.add('chateau'); center.textContent='🏰';
    occupy(idx(Math.floor(CONFIG.GRID.rows/2), Math.floor(CONFIG.GRID.cols/2)));
    setState({ castleBuilt: true });
    toUpgradeUI();
    houseCard.style.display = '';
    recalcIncome();
    upsertCastleCard();
    beep();
  }, CONFIG.CASTLE.buildTimeMs);
}

function toUpgradeUI(){
  castleActions.innerHTML = `<button class="btn primary" id="upgradeCastleBtn">${state.castleLevel<CONFIG.CASTLE.maxLevel?`Améliorer (coût ${upgradeCost()} or)`:'Niveau max'}</button>
  <span class="small muted" id="castleMsg">—</span>`;
  document.getElementById('upgradeCastleBtn').addEventListener('click', onUpgradeCastle);
  updateLabels();
}

function upgradeCost(){
  // cost = base * currentLevel
  return CONFIG.CASTLE.upgradeBaseCost * state.castleLevel;
}

function onUpgradeCastle(){
  if (state.castleLevel>=CONFIG.CASTLE.maxLevel) return;
  const cost = upgradeCost();
  if (state.gold < cost){ castleMsg.textContent = `Pas assez d’or (${cost})`; return; }
  setState({ gold: state.gold - cost });
  // quick 1s animation
  castleFill.style.transition='none'; castleFill.style.width='0%';
  requestAnimationFrame(()=>{ castleFill.style.transition='width 1s linear'; castleFill.style.width='100%'; });
  setTimeout(()=>{
    setState({ castleLevel: state.castleLevel + 1 });
    updateLabels();
    toUpgradeUI();
    recalcIncome();
    upsertCastleCard();
  }, 1000);
}

function buildHouse(){
  if (!state.castleBuilt){ houseMsg.textContent='Construis d’abord le château.'; return; }
  if (state.houses >= state.castleLevel){ houseMsg.textContent=`Limite atteinte (niv. château ${state.castleLevel}).`; return; }
  if (state.gold < CONFIG.HOUSE.costGold){ houseMsg.textContent=`Pas assez d’or (${CONFIG.HOUSE.costGold}).`; return; }

  setState({ gold: state.gold - CONFIG.HOUSE.costGold });
  buildHouseBtn.disabled = true;
  houseFill.style.transition='none'; houseFill.style.width='0%';
  requestAnimationFrame(()=>{ houseFill.style.transition='width 5s linear'; houseFill.style.width='100%'; });
  setTimeout(()=>{
    buildHouseBtn.disabled=false; houseFill.style.transition='none'; houseFill.style.width='0%';
    const i = getRandomFreeCell(true);
    if (i===null){ houseMsg.textContent='Plus d’emplacements libres !'; return; }
    placeEmoji(i,'🏠','house'); occupy(i);
    state.housePositions.push(i);
    setState({ houses: state.houses + 1, pop: state.pop + CONFIG.HOUSE.popGain });
    recalcIncome();
    upsertHousesCard();
  }, CONFIG.HOUSE.buildTimeMs);
}
