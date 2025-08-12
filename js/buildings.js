import { CONFIG } from './config.js';
import { state, setState } from './state.js';
import { getCenterCell, idx, occupy, getRandomFreeCell, placeEmoji } from './grid.js';
import { upsertCastleCard, upsertHousesCard, upsertFieldsCard, upsertCampsCard, upsertMinesCard } from './panel.js';
import { placeNaturalResources } from './resources.js';

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

export function initBuildings(){
  buildCastleBtn.addEventListener('click', buildCastle);
  buildHouseBtn.addEventListener('click', buildHouse);
  buildFieldBtn.addEventListener('click', buildField);
  buildCampBtn.addEventListener('click', buildCamp);
  buildMineBtn.addEventListener('click', buildMine);

  if (state.castleBuilt) showAfterCastle();
}
function showAfterCastle(){
  houseCard.style.display='';
  castleActions.innerHTML = `<span class="small muted">Château construit. Cliquez sur 🏰 pour générer de l'or.</span>`;
}
function buildCastle(){
  if (state.castleBuilt) return;
  castleFill.style.transition='none'; castleFill.style.width='0%';
  requestAnimationFrame(()=>{ castleFill.style.transition='width 6s linear'; castleFill.style.width='100%'; });
  buildCastleBtn.disabled = true; castleMsg.textContent = 'Construction… (6s)';
  setTimeout(()=>{
    const ci = idx(Math.floor(CONFIG.GRID.rows/2), Math.floor(CONFIG.GRID.cols/2));
    placeEmoji(ci,'🏰','castle');
    setState({ castleBuilt: true });
    showAfterCastle();
    upsertCastleCard();
    placeNaturalResources();
  }, CONFIG.CASTLE.buildTimeMs);
}
function buildHouse(){
  if (state.gold < CONFIG.HOUSE.costGold){ houseMsg.textContent=`Pas assez d’or (${CONFIG.HOUSE.costGold}).`; return; }
  houseFill.style.transition='none'; houseFill.style.width='0%';
  requestAnimationFrame(()=>{ houseFill.style.transition='width 5s linear'; houseFill.style.width='100%'; });
  buildHouseBtn.disabled=true;
  setTimeout(()=>{
    buildHouseBtn.disabled=false; houseFill.style.transition='none'; houseFill.style.width='0%';
    const i = getRandomFreeCell(true); if(i===null){ houseMsg.textContent='Plus d’emplacements libres !'; return; }
    placeEmoji(i,'🏠','house'); state.housePositions.push(i);
    setState({ gold: state.gold - CONFIG.HOUSE.costGold, houses: state.houses + 1, pop: state.pop + CONFIG.HOUSE.popGain });
    upsertHousesCard();
    fieldCard.style.display=''; campCard.style.display=''; mineCard.style.display='';
  }, CONFIG.HOUSE.buildTimeMs);
}
function buildField(){
  if (state.gold < CONFIG.FIELD.costGold){ fieldMsg.textContent=`Pas assez d’or (${CONFIG.FIELD.costGold}).`; return; }
  if (state.pop < 1){ fieldMsg.textContent='Population insuffisante (1).'; return; }
  fieldFill.style.transition='none'; fieldFill.style.width='0%';
  requestAnimationFrame(()=>{ fieldFill.style.transition='width 4s linear'; fieldFill.style.width='100%'; });
  buildFieldBtn.disabled=true;
  setTimeout(()=>{
    buildFieldBtn.disabled=false; fieldFill.style.transition='none'; fieldFill.style.width='0%';
    const i = getRandomFreeCell(true); if(i===null){ fieldMsg.textContent='Plus d’emplacements libres !'; return; }
    placeEmoji(i,'🌾','field'); state.fieldPositions.push(i);
    setState({ gold: state.gold - CONFIG.FIELD.costGold, pop: state.pop - 1, fields: state.fields + 1 });
    upsertFieldsCard();
  }, CONFIG.FIELD.buildTimeMs);
}
function isAdjacentTo(list, i){
  const cols = CONFIG.GRID.cols;
  const r = Math.floor(i/cols), c = i%cols;
  return list.some(ti=>{ const tr=Math.floor(ti/cols), tc=ti%cols; return (Math.abs(tr-r)+Math.abs(tc-c))===1; });
}
function buildCamp(){
  if (state.gold < CONFIG.CAMP.costGold){ campMsg.textContent=`Pas assez d’or (${CONFIG.CAMP.costGold}).`; return; }
  if (state.pop < 1){ campMsg.textContent='Population insuffisante (1).'; return; }
  campFill.style.transition='none'; campFill.style.width='0%';
  requestAnimationFrame(()=>{ campFill.style.transition='width 6s linear'; campFill.style.width='100%'; });
  buildCampBtn.disabled=true;
  setTimeout(()=>{
    buildCampBtn.disabled=false; campFill.style.transition='none'; campFill.style.width='0%';
    let i = getRandomFreeCell(true); if(i===null){ campMsg.textContent='Plus d’emplacements libres !'; return; }
    // require adjacency to a future 🌳 (none yet at prestige 0, keep placement free for now or comment in later)
    placeEmoji(i,'🪓','camp'); state.campPositions.push(i);
    setState({ gold: state.gold - CONFIG.CAMP.costGold, pop: state.pop - 1, camps: state.camps + 1 });
    upsertCampsCard();
  }, CONFIG.CAMP.buildTimeMs);
}
function buildMine(){
  if (state.gold < CONFIG.MINE.costGold || state.wood < CONFIG.MINE.costWood){ mineMsg.textContent=`Coût: ${CONFIG.MINE.costGold} or + ${CONFIG.MINE.costWood} bois.`; return; }
  if (state.pop < 1){ mineMsg.textContent='Population insuffisante (1).'; return; }
  mineFill.style.transition='none'; mineFill.style.width='0%';
  requestAnimationFrame(()=>{ mineFill.style.transition='width 8s linear'; mineFill.style.width='100%'; });
  buildMineBtn.disabled=true;
  setTimeout(()=>{
    buildMineBtn.disabled=false; mineFill.style.transition='none'; mineFill.style.width='0%';
    let i = getRandomFreeCell(true); if(i===null){ mineMsg.textContent='Plus d’emplacements libres !'; return; }
    placeEmoji(i,'⛏️','mine'); state.minePositions.push(i);
    setState({ gold: state.gold - CONFIG.MINE.costGold, wood: state.wood - CONFIG.MINE.costWood, pop: state.pop - 1, mines: state.mines + 1 });
    upsertMinesCard();
  }, CONFIG.MINE.buildTimeMs);
}
