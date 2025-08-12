import { CONFIG } from '../config.js';
import { state, setState } from '../state.js';

const foremanCard = document.getElementById('foremanCard'); const buildForemanBtn = document.getElementById('buildForemanBtn');
const toggleForemanBtn = document.getElementById('toggleForemanBtn'); const upgradeForemanBtn = document.getElementById('upgradeForemanBtn'); const foremanMsg = document.getElementById('foremanMsg');

export function initForeman(){
  buildForemanBtn.addEventListener('click', buildForeman);
  toggleForemanBtn.addEventListener('click', toggleForeman);
  upgradeForemanBtn.addEventListener('click', upgradeForeman);
  updateForemanUI();
}
export function updateForemanUI(){
  if(!foremanCard) return;
  if(!state.castleBuilt) { foremanCard.style.display='none'; return; }
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
function buildForeman(){
  if(state.foreman.built) return;
  const cost=CONFIG.COSTS.FOREMAN;
  if(state.gold<cost.gold || state.wood<cost.wood || state.pop<cost.pop){ foremanMsg.textContent = `Coût: ${cost.gold} or, ${cost.wood} bois, ${cost.pop} pop.`; return; }
  setState({ gold: state.gold-cost.gold, wood: state.wood-cost.wood, pop: state.pop-cost.pop, foreman: { built:true, level:1, on:true, clicksPerSec:1, wheatPerMin:5 } });
  updateForemanUI();
}
function toggleForeman(){ if(!state.foreman.built) return; state.foreman.on=!state.foreman.on; setState({ foreman: state.foreman }); updateForemanUI(); }
function upgradeForeman(){
  if(!state.foreman.built) return;
  const next = state.foreman.level+1;
  const cost = Math.ceil(15 * Math.pow(1.6, state.foreman.level-1));
  if(state.gold < cost){ foremanMsg.textContent=`Coût: ${cost} or`; return; }
  state.foreman.level = next; state.foreman.clicksPerSec = 1 + 0.5*(next-1); state.foreman.wheatPerMin = 5 + 2*(next-1);
  setState({ gold: state.gold-cost, foreman: state.foreman });
  updateForemanUI();
}
