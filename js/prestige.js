import { CONFIG } from './config.js';
import { state, setState } from './state.js';
import { repaintFromState } from './grid.js';
import { refreshAll } from './panel.js';

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
  const keep = { version: state.version, prestige: state.prestige+1, prestigePoints: state.prestigePoints };
  setState(Object.assign({
    gold: 0, wood: 0, stone: 0, wheat: 0, pop: 0,
    woodCap: CONFIG.STORAGE.woodCap, stoneCap: CONFIG.STORAGE.stoneCap,
    zoneRadius: 2, muted: state.muted,
    castleBuilt: false, castleLevel: 1,
    houses:0, fields:0, camps:0, mines:0, mills:0, warehouses:0, markets:0,
    stamina:{ castle:100, field:100, camp:100, mine:100 },
    levels:{ field:1, camp:1, mine:1 },
    occupied:[], housePositions:[], fieldPositions:[], campPositions:[], minePositions:[],
    millPositions:[], warePositions:[], marketPositions:[],
    treePositions:[], rockPositions:[],
    globalMult: 1.0,
    clicks:{castle:0,field:0,camp:0,mine:0},
    totals:{gold:0,wheat:0,wood:0,stone:0},
    achievements: state.achievements, quests: {}
  }, keep));
  repaintFromState(); refreshAll();
}
function doPrestige(){
  const pointsGained = Math.floor(Math.max(0, state.gold)/100); // simple formula
  setState({ prestigePoints: state.prestigePoints + pointsGained });
  resetForPrestige();
  prestigeModal.classList.remove('open');
  updatePP();
}
function spendPoint(id, nodeEl){
  if(state.prestigePoints<=0) return;
  if(nodeEl.classList.contains('taken')) return;
  nodeEl.classList.add('taken');
  setState({ prestigePoints: state.prestigePoints - 1 });
  if(id==='foreman'){ /* foreman unlock placeholder */ }
  if(id==='stamina'){ /* regen boost via config not persisted; just buff globalMult as proxy */ setState({ globalMult: state.globalMult*1.02 }); }
  if(id==='crit'){ /* mark in achievements */ state.achievements['critPlus']=true; setState({ achievements: state.achievements }); }
  if(id==='hold'){ /* stronger charge */ CONFIG.CLICK.holdMult = 3.5; }
  updatePP();
}
