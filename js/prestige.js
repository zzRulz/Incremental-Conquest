import { state, setState } from './state.js';
import { repaintFromState } from './grid.js';
import { refreshAll } from './panel.js';
import { updateForemanUI } from './modules/foreman.js';

const prestigeBtn = document.getElementById('prestigeBtn');
const prestigeModal = document.getElementById('prestigeModal');
const prestigeBackdrop = document.getElementById('prestigeBackdrop');
const prestigeClose = document.getElementById('prestigeClose');
const doPrestigeBtn = document.getElementById('doPrestige');
const tree = document.getElementById('tree'); const ppEl = document.getElementById('pp');

export function initPrestige(){
  prestigeBtn.addEventListener('click', ()=> prestigeModal.classList.add('open'));
  prestigeBackdrop.addEventListener('click', ()=> prestigeModal.classList.remove('open'));
  prestigeClose.addEventListener('click', ()=> prestigeModal.classList.remove('open'));
  doPrestigeBtn.addEventListener('click', doPrestige);
  tree.addEventListener('click', (e)=>{
    const node = e.target.closest('.node'); if(!node) return;
    const id = node.dataset.id;
    spendPoint(id, node);
  });
  updatePP();
}
function updatePP(){ ppEl.textContent = state.prestigePoints; }

function resetForPrestige(){
  const keep = { version: state.version, prestige: state.prestige+1, prestigePoints: state.prestigePoints, achievements: state.achievements, artifacts: state.artifacts, artBonus: state.artBonus };
  setState(Object.assign({
    gold: 0, wood: 0, stone: 0, wheat: 0, science: 0, pop: 0,
    woodCap: 10, stoneCap: 10,
    zoneRadius: 2, zoneLevel: 1, zoneBonus:{}, zoneName:'Campement',
    castleBuilt: false, castleLevel: 1,
    houses:0, fields:0, camps:0, mines:0, mills:0, warehouses:0, markets:0, libraries:0,
    foreman:{ built:false, level:0, on:false, clicksPerSec:1, wheatPerMin:5 },
    stamina:{ castle:100, field:100, camp:100, mine:100 },
    levels:{ field:1, camp:1, mine:1 },
    occupied:[], housePositions:[], fieldPositions:[], campPositions:[], minePositions:[],
    millPositions:[], warePositions:[], marketPositions:[], libraryPositions:[],
    treePositions:[], rockPositions:[],
    globalMult: 1.0,
    event:{ id:null, label:'Aucun événement', timeLeft:0, mult:{}, marketBonus:0 },
    tech:{}, techBonus:{},
    clicks:{castle:0,field:0,camp:0,mine:0,library:0},
    totals:{gold:0,wheat:0,wood:0,stone:0,science:0},
    quests: {},
    market: { wheat:0.8, wood:0.6, stone:0.7 },
    boss: { active:false, hp:0, max:0, index:null, name:'' },
  }, keep));
  repaintFromState(); refreshAll(); updateForemanUI();
}
function doPrestige(){
  // 2.3g hotfix: prestige at castle lvl >= 10, then reset run
  if (state.castleLevel < 10) return false;
  const gained = Math.max(1, Math.floor((state.totalGold||0) / 1e6));
  // reset buildings counts if present in state
  if (state.buildings) { Object.keys(state.buildings).forEach(k=>{ state.buildings[k]=0; }); }
  state.castleLevel = 1;
  state.gold = 0; state.wood = 0; state.stone = 0; state.wheat = 0; state.science = 0;
  state.incomePerTick = 0;
  state.prestige += gained; state.prestigePoints = (state.prestigePoints||0) + gained;
  return true;
}
function spendPoint(id, nodeEl){
  if(state.prestigePoints<=0) return;
  if(nodeEl.classList.contains('taken')) return;
  nodeEl.classList.add('taken');
  setState({ prestigePoints: state.prestigePoints - 1 });
  if(id==='foremanUnlock'){ state.achievements['foremanUnlock']=true; setState({ achievements: state.achievements }); updateForemanUI(); }
  if(id==='foremanSpeed'){ state.foreman.clicksPerSec *= 1.25; setState({ foreman: state.foreman }); }
  if(id==='stamina'){ state.globalMult = state.globalMult*1.02; }
  if(id==='crit'){ state.achievements['critPlus']=true; setState({ achievements: state.achievements }); }
  if(id==='hold'){ /* applies in config at runtime */ }
  if(id==='global'){ setState({ globalMult: state.globalMult*1.05 }); }
  updatePP();
}
