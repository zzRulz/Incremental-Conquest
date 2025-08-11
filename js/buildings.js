import { CONFIG } from './config.js';
import { state, setState } from './state.js';
import { getCenterCell, idx, occupy, getRandomFreeCell, placeEmoji } from './grid.js';
import { beep } from './sound.js';
import { recalcIncome } from './economy.js';
import { upsertCastleCard, upsertHousesCard, upsertFieldsCard, upsertCampsCard, upsertMinesCard, upsertWarehousesCard } from './panel.js';
import { placeNaturalResources, maybeUnlockBuilds } from './resources.js';

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

const fieldCard = document.getElementById('fieldCard');
const buildFieldBtn = document.getElementById('buildFieldBtn');
const fieldFill = document.getElementById('fieldFill');
const fieldMsg = document.getElementById('fieldMsg');

const campCard = document.getElementById('campCard');
const buildCampBtn = document.getElementById('buildCampBtn');
const campFill = document.getElementById('campFill');
const campMsg = document.getElementById('campMsg');

const mineCard = document.getElementById('mineCard');
const buildMineBtn = document.getElementById('buildMineBtn');
const mineFill = document.getElementById('mineFill');
const mineMsg = document.getElementById('mineMsg');

const warehouseCard = document.getElementById('warehouseCard');
const buildWarehouseBtn = document.getElementById('buildWarehouseBtn');
const warehouseFill = document.getElementById('warehouseFill');
const warehouseMsg = document.getElementById('warehouseMsg');

export function initBuildings(){
  buildCastleBtn.addEventListener('click', buildCastle);
  buildHouseBtn.addEventListener('click', buildHouse);
  buildFieldBtn.addEventListener('click', buildField);
  buildCampBtn.addEventListener('click', buildCamp);
  buildMineBtn.addEventListener('click', buildMine);
  buildWarehouseBtn.addEventListener('click', buildWarehouse);

  // restore
  if (state.castleBuilt){
    const center = getCenterCell();
    center.classList.remove('glow'); center.classList.add('chateau'); center.textContent='🏰';
    toUpgradeUI();
    houseCard.style.display = '';
  }
  if(state.fields>0) fieldCard.style.display='';
  if(state.firstHouse) maybeUnlockBuilds();
  updateLabels(); recalcIncome();
  upsertCastleCard(); if(state.houses>0) upsertHousesCard(); if(state.fields>0) upsertFieldsCard();
  if(state.camps>0) upsertCampsCard(); if(state.mines>0) upsertMinesCard(); if(state.warehouses>0) upsertWarehousesCard();
}

function updateLabels(){
  castleHead.textContent = `🏰 Château (Niv. ${state.castleLevel})`;
  castleDesc.innerHTML = `Prod: <b>+${state.castleLevel} or/tick</b> • Limite maisons: <b id="houseLimitLabel">${state.castleLevel}</b>`;
}

function upgradeCost(){ return CONFIG.CASTLE.upgradeBaseCost * state.castleLevel; }

function buildCastle(){
  if (state.castleBuilt) return;
  castleFill.style.transition='none'; castleFill.style.width='0%';
  requestAnimationFrame(()=>{ castleFill.style.transition='width 10s linear'; castleFill.style.width='100%'; });
  buildCastleBtn.disabled = true; castleMsg.textContent = 'Construction… (10s)';
  setTimeout(()=>{
    const center=getCenterCell(); center.classList.remove('glow'); center.classList.add('chateau'); center.textContent='🏰';
    occupy(idx(Math.floor(CONFIG.GRID.rows/2), Math.floor(CONFIG.GRID.cols/2)));
    setState({ castleBuilt: true });
    toUpgradeUI(); houseCard.style.display=''; recalcIncome(); upsertCastleCard(); beep();
  }, CONFIG.CASTLE.buildTimeMs);
}

function toUpgradeUI(){
  castleActions.innerHTML = `<button class="btn primary" id="upgradeCastleBtn">${state.castleLevel<CONFIG.CASTLE.maxLevel?`Améliorer (coût ${upgradeCost()} or)`:'Niveau max'}</button>
  <span class="small muted" id="castleMsg">—</span>`;
  document.getElementById('upgradeCastleBtn').addEventListener('click', onUpgradeCastle);
  updateLabels();
  window.updatePrestigeButton && window.updatePrestigeButton();
}

function onUpgradeCastle(){
  if (state.castleLevel>=CONFIG.CASTLE.maxLevel) return;
  const cost = upgradeCost();
  if (state.gold < cost){ castleMsg.textContent = `Pas assez d’or (${cost})`; return; }
  setState({ gold: state.gold - cost });
  castleFill.style.transition='none'; castleFill.style.width='0%';
  requestAnimationFrame(()=>{ castleFill.style.transition='width 1s linear'; castleFill.style.width='100%'; });
  setTimeout(()=>{
    setState({ castleLevel: state.castleLevel + 1 });
    updateLabels(); toUpgradeUI(); recalcIncome(); upsertCastleCard();
    window.updatePrestigeButton && window.updatePrestigeButton();
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
    const i = getRandomFreeCell(true); if(i===null){ houseMsg.textContent='Plus d’emplacements libres !'; return; }
    placeEmoji(i,'🏠','house'); occupy(i);
    state.housePositions.push(i);
    setState({ houses: state.houses + 1, pop: state.pop + CONFIG.HOUSE.popGain, firstHouse: true });
    recalcIncome(); upsertHousesCard(); fieldCard.style.display=''; maybeUnlockBuilds();
  }, CONFIG.HOUSE.buildTimeMs);
}

function buildField(){
  if (state.gold < CONFIG.FIELD.costGold){ fieldMsg.textContent=`Pas assez d’or (${CONFIG.FIELD.costGold}).`; return; }
  setState({ gold: state.gold - CONFIG.FIELD.costGold });
  buildFieldBtn.disabled=true;
  fieldFill.style.transition='none'; fieldFill.style.width='0%';
  requestAnimationFrame(()=>{ fieldFill.style.transition='width 4s linear'; fieldFill.style.width='100%'; });
  setTimeout(()=>{
    buildFieldBtn.disabled=false; fieldFill.style.transition='none'; fieldFill.style.width='0%';
    const i = getRandomFreeCell(true); if(i===null){ fieldMsg.textContent='Plus d’emplacements libres !'; return; }
    placeEmoji(i,'🌾','field'); occupy(i); state.fieldPositions.push(i);
    setState({ fields: state.fields + 1 }); recalcIncome(); upsertFieldsCard();
  }, CONFIG.FIELD.buildTimeMs);
}

function buildCamp(){
  if (!state.firstHouse){ campMsg.textContent='Construis d’abord une maison.'; return; }
  if (state.gold < CONFIG.CAMP.costGold){ campMsg.textContent=`Pas assez d’or (${CONFIG.CAMP.costGold}).`; return; }
  if (state.pop < CONFIG.CAMP.popCost){ campMsg.textContent=`Population insuffisante (${CONFIG.CAMP.popCost}).`; return; }
  if (state.treePositions.length<=0){ campMsg.textContent='Aucun arbre (prestige pour en faire apparaître).'; return; }
  setState({ gold: state.gold - CONFIG.CAMP.costGold, pop: state.pop - CONFIG.CAMP.popCost });
  buildCampBtn.disabled=true;
  campFill.style.transition='none'; campFill.style.width='0%';
  requestAnimationFrame(()=>{ campFill.style.transition='width 6s linear'; campFill.style.width='100%'; });
  setTimeout(()=>{
    buildCampBtn.disabled=false; campFill.style.transition='none'; campFill.style.width='0%';
    const i = getRandomFreeCell(true); if(i===null){ campMsg.textContent='Plus d’emplacements libres !'; return; }
    placeEmoji(i,'🪓','camp'); occupy(i); state.campPositions.push(i);
    setState({ camps: state.camps + 1 }); upsertCampsCard();
  }, CONFIG.CAMP.buildTimeMs);
}

function buildMine(){
  if (!state.firstHouse){ mineMsg.textContent='Construis d’abord une maison.'; return; }
  if (state.prestige < 3){ mineMsg.textContent='Prestige 3 requis.'; return; }
  if (state.rockPositions.length<=0){ mineMsg.textContent='Aucune pierre disponible.'; return; }
  if (state.gold < CONFIG.MINE.costGold || state.wood < CONFIG.MINE.costWood){ mineMsg.textContent=`Coût: ${CONFIG.MINE.costGold} or + ${CONFIG.MINE.costWood} bois.`; return; }
  if (state.pop < CONFIG.MINE.popCost){ mineMsg.textContent=`Population insuffisante (${CONFIG.MINE.popCost}).`; return; }
  setState({ gold: state.gold - CONFIG.MINE.costGold, wood: state.wood - CONFIG.MINE.costWood, pop: state.pop - CONFIG.MINE.popCost });
  buildMineBtn.disabled=true;
  mineFill.style.transition='none'; mineFill.style.width='0%';
  requestAnimationFrame(()=>{ mineFill.style.transition='width 8s linear'; mineFill.style.width='100%'; });
  setTimeout(()=>{
    buildMineBtn.disabled=false; mineFill.style.transition='none'; mineFill.style.width='0%';
    const i = getRandomFreeCell(true); if(i===null){ mineMsg.textContent='Plus d’emplacements libres !'; return; }
    placeEmoji(i,'⛏️','mine'); occupy(i); state.minePositions.push(i);
    setState({ mines: state.mines + 1 }); upsertMinesCard();
  }, CONFIG.MINE.buildTimeMs);
}

function buildWarehouse(){
  if (state.prestige < 3){ warehouseMsg.textContent='Prestige 3 requis.'; return; }
  if (state.wood < CONFIG.WARE.costWood || state.stone < CONFIG.WARE.costStone){ warehouseMsg.textContent=`Coût: ${CONFIG.WARE.costWood} bois + ${CONFIG.WARE.costStone} pierre.`; return; }
  setState({ wood: state.wood - CONFIG.WARE.costWood, stone: state.stone - CONFIG.WARE.costStone });
  buildWarehouseBtn.disabled=true;
  warehouseFill.style.transition='none'; warehouseFill.style.width='0%';
  requestAnimationFrame(()=>{ warehouseFill.style.transition='width 8s linear'; warehouseFill.style.width='100%'; });
  setTimeout(()=>{
    buildWarehouseBtn.disabled=false; warehouseFill.style.transition='none'; warehouseFill.style.width='0%';
    setState({ warehouses: state.warehouses + 1, woodCap: state.woodCap + CONFIG.WARE.capPlus, stoneCap: state.stoneCap + CONFIG.WARE.capPlus });
    upsertWarehousesCard();
  }, CONFIG.WARE.buildTimeMs);
}
