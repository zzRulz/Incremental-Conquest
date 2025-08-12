import { CONFIG, bumpPatch } from './config.js';
import { state, setState } from './state.js';
import { idx, getRandomFreeCell, getFreeAdjacentTo, placeEmoji, getCenterIndex } from './grid.js';
import { refreshAll } from './panel.js';
import { placeNaturalResources } from './resources.js';

// Right panel elements
const buildCastleBtn = document.getElementById('buildCastleBtn'); const castleFill = document.getElementById('castleFill'); const castleMsg = document.getElementById('castleMsg');
const buildHouseBtn = document.getElementById('buildHouseBtn'); const houseFill = document.getElementById('houseFill'); const houseMsg = document.getElementById('houseMsg'); const houseCard = document.getElementById('houseCard');
const buildFieldBtn = document.getElementById('buildFieldBtn'); const fieldFill = document.getElementById('fieldFill'); const fieldMsg = document.getElementById('fieldMsg'); const fieldCard = document.getElementById('fieldCard');
const buildCampBtn = document.getElementById('buildCampBtn'); const campFill = document.getElementById('campFill'); const campMsg = document.getElementById('campMsg'); const campCard = document.getElementById('campCard');
const buildMineBtn = document.getElementById('buildMineBtn'); const mineFill = document.getElementById('mineFill'); const mineMsg = document.getElementById('mineMsg'); const mineCard = document.getElementById('mineCard');
const buildMillBtn = document.getElementById('buildMillBtn'); const millFill = document.getElementById('millFill'); const millMsg = document.getElementById('millMsg'); const millCard = document.getElementById('millCard');
const buildWarehouseBtn = document.getElementById('buildWarehouseBtn'); const warehouseFill = document.getElementById('warehouseFill'); const warehouseMsg = document.getElementById('warehouseMsg'); const warehouseCard = document.getElementById('warehouseCard');
const buildMarketBtn = document.getElementById('buildMarketBtn'); const marketFill = document.getElementById('marketFill'); const marketMsg = document.getElementById('marketMsg'); const marketCard = document.getElementById('marketCard');
const marketUI = document.getElementById('marketUI');

// Foreman
const foremanCard = document.getElementById('foremanCard'); const buildForemanBtn = document.getElementById('buildForemanBtn'); const toggleForemanBtn = document.getElementById('toggleForemanBtn'); const upgradeForemanBtn = document.getElementById('upgradeForemanBtn'); const foremanMsg = document.getElementById('foremanMsg');

// Market buttons
const sellWheatBtn = document.getElementById('sellWheat'); const sellWoodBtn = document.getElementById('sellWood'); const sellStoneBtn = document.getElementById('sellStone');
const priceWheat = document.getElementById('priceWheat'); const priceWood = document.getElementById('priceWood'); const priceStone = document.getElementById('priceStone');

export function initBuildings(){
  buildCastleBtn.addEventListener('click', buildCastle);
  buildHouseBtn.addEventListener('click', buildHouse);
  buildFieldBtn.addEventListener('click', buildField);
  buildCampBtn.addEventListener('click', buildCamp);
  buildMineBtn.addEventListener('click', buildMine);
  buildMillBtn.addEventListener('click', buildMill);
  buildWarehouseBtn.addEventListener('click', buildWarehouse);
  buildMarketBtn.addEventListener('click', buildMarket);
  sellWheatBtn.addEventListener('click', sellWheat);
  sellWoodBtn.addEventListener('click', sellWood);
  sellStoneBtn.addEventListener('click', sellStone);
  buildForemanBtn.addEventListener('click', buildForeman);
  toggleForemanBtn.addEventListener('click', toggleForeman);
  upgradeForemanBtn.addEventListener('click', upgradeForeman);

  if (state.castleBuilt) unlockAfterCastle();
  updateMarketPrices();
  updateForemanCard();
}
function unlockAfterCastle(){
  houseCard.style.display=''; fieldCard.style.display=''; campCard.style.display=''; mineCard.style.display=''; millCard.style.display=''; warehouseCard.style.display=''; marketCard.style.display='';
  marketUI.style.display = state.markets>0 ? '' : 'none';
  // Foreman card if unlocked in prestige
  if(state.achievements['foremanUnlock'] || state.prestigePoints>=0){ foremanCard.style.display=''; }
  updateForemanCard();
}
function buildCastle(){
  if (state.castleBuilt) return;
  castleFill.style.transition='none'; castleFill.style.width='0%';
  requestAnimationFrame(()=>{ castleFill.style.transition='width 6s linear'; castleFill.style.width='100%'; });
  buildCastleBtn.disabled = true; castleMsg.textContent = 'Construction… (6s)';
  setTimeout(()=>{
    const ci = getCenterIndex();
    placeEmoji(ci,'🏰','castle');
    setState({ castleBuilt: true });
    unlockAfterCastle();
    refreshAll(); placeNaturalResources();
  }, CONFIG.COSTS.CASTLE.timeMs);
}
function buildHouse(){
  const cost=CONFIG.COSTS.HOUSE;
  if (state.gold < cost.gold){ houseMsg.textContent=`Pas assez d’or (${cost.gold}).`; return; }
  houseFill.style.transition='none'; houseFill.style.width='0%'; requestAnimationFrame(()=>{ houseFill.style.transition='width 5s linear'; houseFill.style.width='100%'; });
  buildHouseBtn.disabled=true;
  setTimeout(()=>{
    buildHouseBtn.disabled=false; houseFill.style.transition='none'; houseFill.style.width='0%';
    const i = getRandomFreeCell(true); if(i===null){ houseMsg.textContent='Plus d’emplacements libres !'; return; }
    placeEmoji(i,'🏠','house'); state.housePositions.push(i);
    setState({ gold: state.gold - cost.gold, houses: state.houses + 1, pop: state.pop + cost.popGain });
    refreshAll();
  }, cost.timeMs);
}
function buildField(){
  const cost=CONFIG.COSTS.FIELD;
  if (state.gold < cost.gold){ fieldMsg.textContent=`Pas assez d’or (${cost.gold}).`; return; }
  if (state.pop < cost.pop){ fieldMsg.textContent=`Population insuffisante (${cost.pop}).`; return; }
  fieldFill.style.transition='none'; fieldFill.style.width='0%'; requestAnimationFrame(()=>{ fieldFill.style.transition='width 4s linear'; fieldFill.style.width='100%'; });
  buildFieldBtn.disabled=true;
  setTimeout(()=>{
    buildFieldBtn.disabled=false; fieldFill.style.transition='none'; fieldFill.style.width='0%';
    const i = getRandomFreeCell(true); if(i===null){ fieldMsg.textContent='Plus d’emplacements libres !'; return; }
    placeEmoji(i,'🌾','field'); state.fieldPositions.push(i);
    setState({ gold: state.gold - cost.gold, pop: state.pop - cost.pop, fields: state.fields + 1 });
    refreshAll();
  }, cost.timeMs);
}
function buildCamp(){
  const cost=CONFIG.COSTS.CAMP;
  if (state.gold < cost.gold){ campMsg.textContent=`Pas assez d’or (${cost.gold}).`; return; }
  if (state.pop < cost.pop){ campMsg.textContent=`Population insuffisante (${cost.pop}).`; return; }
  if (state.treePositions.length<=0){ campMsg.textContent='Aucun arbre dispo (Prestige 2+).'; return; }
  campFill.style.transition='none'; campFill.style.width='0%'; requestAnimationFrame(()=>{ campFill.style.transition='width 6s linear'; campFill.style.width='100%'; });
  buildCampBtn.disabled=true;
  setTimeout(()=>{
    buildCampBtn.disabled=false; campFill.style.transition='none'; campFill.style.width='0%';
    let i = getFreeAdjacentTo(state.treePositions);
    if(i===null){ campMsg.textContent='Pas de case libre adjacente à un arbre.'; return; }
    placeEmoji(i,'🪓','camp'); state.campPositions.push(i);
    setState({ gold: state.gold - cost.gold, pop: state.pop - cost.pop, camps: state.camps + 1 });
    refreshAll();
  }, cost.timeMs);
}
function buildMine(){
  const cost=CONFIG.COSTS.MINE;
  if (state.gold < cost.gold || state.wood < cost.wood){ mineMsg.textContent=`Coût: ${cost.gold} or + ${cost.wood} bois.`; return; }
  if (state.pop < cost.pop){ mineMsg.textContent=`Population insuffisante (${cost.pop}).`; return; }
  if (state.rockPositions.length<=0){ mineMsg.textContent='Aucune roche dispo.'; return; }
  mineFill.style.transition='none'; mineFill.style.width='0%'; requestAnimationFrame(()=>{ mineFill.style.transition='width 8s linear'; mineFill.style.width='100%'; });
  buildMineBtn.disabled=true;
  setTimeout(()=>{
    buildMineBtn.disabled=false; mineFill.style.transition='none'; mineFill.style.width='0%';
    let i = getFreeAdjacentTo(state.rockPositions);
    if(i===null){ mineMsg.textContent='Pas de case libre adjacente à une roche.'; return; }
    placeEmoji(i,'⛏️','mine'); state.minePositions.push(i);
    setState({ gold: state.gold - cost.gold, wood: state.wood - cost.wood, pop: state.pop - cost.pop, mines: state.mines + 1 });
    refreshAll();
  }, cost.timeMs);
}
function buildMill(){
  const cost=CONFIG.COSTS.MILL;
  if (state.gold < cost.gold || state.wood < cost.wood){ millMsg.textContent=`Coût: ${cost.gold} or + ${cost.wood} bois.`; return; }
  millFill.style.transition='none'; millFill.style.width='0%'; requestAnimationFrame(()=>{ millFill.style.transition='width 6s linear'; millFill.style.width='100%'; });
  buildMillBtn.disabled=true;
  setTimeout(()=>{
    buildMillBtn.disabled=false; millFill.style.transition='none'; millFill.style.width='0%';
    let i = getRandomFreeCell(true); if(i===null){ millMsg.textContent='Plus d’emplacements libres !'; return; }
    placeEmoji(i,'🌬️','mill'); state.millPositions.push(i);
    setState({ gold: state.gold - cost.gold, wood: state.wood - cost.wood, mills: state.mills + 1 });
    refreshAll();
  }, cost.timeMs);
}
function buildWarehouse(){
  const cost=CONFIG.COSTS.WARE;
  if (state.gold < cost.gold || state.wood < cost.wood){ warehouseMsg.textContent=`Coût: ${cost.gold} or + ${cost.wood} bois.`; return; }
  warehouseFill.style.transition='none'; warehouseFill.style.width='0%'; requestAnimationFrame(()=>{ warehouseFill.style.transition='width 4s linear'; warehouseFill.style.width='100%'; });
  buildWarehouseBtn.disabled=true;
  setTimeout(()=>{
    buildWarehouseBtn.disabled=false; warehouseFill.style.transition='none'; warehouseFill.style.width='0%';
    let i = getRandomFreeCell(true); if(i===null){ warehouseMsg.textContent='Plus d’emplacements libres !'; return; }
    placeEmoji(i,'📦','warehouse'); state.warePositions.push(i);
    setState({ gold: state.gold - cost.gold, wood: state.wood - cost.wood, woodCap: state.woodCap + cost.addWood, stoneCap: state.stoneCap + cost.addStone, warehouses: state.warehouses + 1 });
    refreshAll();
  }, cost.timeMs);
}
function buildMarket(){
  const cost=CONFIG.COSTS.MARKET;
  if (state.gold < cost.gold){ marketMsg.textContent=`Pas assez d’or (${cost.gold}).`; return; }
  marketFill.style.transition='none'; marketFill.style.width='0%'; requestAnimationFrame(()=>{ marketFill.style.transition='width 4s linear'; marketFill.style.width='100%'; });
  buildMarketBtn.disabled=true;
  setTimeout(()=>{
    buildMarketBtn.disabled=false; marketFill.style.transition='none'; marketFill.style.width='0%';
    let i = getRandomFreeCell(true); if(i===null){ marketMsg.textContent='Plus d’emplacements libres !'; return; }
    placeEmoji(i,'🏪','market'); state.marketPositions.push(i);
    setState({ gold: state.gold - cost.gold, markets: state.markets + 1 });
    marketUI.style.display='';
    refreshAll();
  }, cost.timeMs);
}

function updateMarketPrices(){
  const bonus = 1 + (state.event.marketBonus||0);
  priceWheat.textContent = `${Math.round(state.market.wheat*10*bonus)} or`;
  priceWood.textContent  = `${Math.round(state.market.wood*10*bonus)} or`;
  priceStone.textContent = `${Math.round(state.market.stone*10*bonus)} or`;
}
function sellWheat(){ const bonus=1+(state.event.marketBonus||0); if(state.wheat>=10){ setState({ wheat: state.wheat-10, gold: state.gold + state.market.wheat*10*bonus }); } }
function sellWood(){ const bonus=1+(state.event.marketBonus||0); if(state.wood>=10){ setState({ wood: state.wood-10, gold: state.gold + state.market.wood*10*bonus }); } }
function sellStone(){ const bonus=1+(state.event.marketBonus||0); if(state.stone>=10){ setState({ stone: state.stone-10, gold: state.gold + state.market.stone*10*bonus }); } }

export function tickMarketDrift(){
  const d=CONFIG.MARKET.drift;
  state.market.wheat = Math.max(0.5, Math.min(1.2, state.market.wheat + (Math.random()*2-1)*d));
  state.market.wood  = Math.max(0.4, Math.min(1.0, state.market.wood  + (Math.random()*2-1)*d));
  state.market.stone = Math.max(0.5, Math.min(1.1, state.market.stone + (Math.random()*2-1)*d));
  setState({ market: state.market });
  updateMarketPrices();
}

// Foreman
function updateForemanCard(){
  if(!foremanCard) return;
  if(!state.castleBuilt) { foremanCard.style.display='none'; return; }
  // Show only if prestige unlock is taken or already built
  foremanCard.style.display = state.achievements['foremanUnlock'] || state.foreman.built ? '' : 'none';
  if(state.foreman.built){
    buildForemanBtn.style.display='none'; toggleForemanBtn.style.display=''; upgradeForemanBtn.style.display='';
    foremanMsg.textContent = `Niv ${state.foreman.level} • ${state.foreman.clicksPerSec.toFixed(1)} clic/s • Conso ${state.foreman.wheatPerMin}/min`;
    toggleForemanBtn.textContent = state.foreman.on?'Pause':'Reprendre';
  } else {
    buildForemanBtn.style.display=''; toggleForemanBtn.style.display='none'; upgradeForemanBtn.style.display='none';
    foremanMsg.textContent = '—';
  }
}
export function updateForemanUI(){ updateForemanCard(); }

function buildForeman(){
  if(state.foreman.built) return;
  const cost=CONFIG.COSTS.FOREMAN;
  if(state.gold<cost.gold || state.wood<cost.wood || state.pop<cost.pop){ foremanMsg.textContent = `Coût: ${cost.gold} or, ${cost.wood} bois, ${cost.pop} pop.`; return; }
  setState({ gold: state.gold-cost.gold, wood: state.wood-cost.wood, pop: state.pop-cost.pop, foreman: { built:true, level:1, on:true, clicksPerSec:1, wheatPerMin:5 } });
  updateForemanCard();
}
function toggleForeman(){ if(!state.foreman.built) return; state.foreman.on=!state.foreman.on; setState({ foreman: state.foreman }); updateForemanCard(); }
function upgradeForeman(){
  if(!state.foreman.built) return;
  const next = state.foreman.level+1;
  const cost = Math.ceil(15 * Math.pow(1.6, state.foreman.level-1));
  if(state.gold < cost){ foremanMsg.textContent=`Coût: ${cost} or`; return; }
  state.foreman.level = next; state.foreman.clicksPerSec = 1 + 0.5*(next-1); state.foreman.wheatPerMin = 5 + 2*(next-1);
  setState({ gold: state.gold-cost, foreman: state.foreman });
  updateForemanCard();
}

export { updateMarketPrices };
