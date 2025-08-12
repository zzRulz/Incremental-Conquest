import { CONFIG } from './config.js';
import { state, setState } from './state.js';
import { upsertCastleCard, upsertFieldsCard, upsertCampsCard, upsertMinesCard } from './panel.js';

let holdMap = new Map(); // key = index, value = timeStart

function perClick(kind){
  const base = CONFIG.CLICK.base[kind] || 0;
  const level = (kind==='castle') ? state.castleLevel : (state.levels[kind]||1);
  const lvlBonus = 1 + (CONFIG.CLICK.levelBonusPct/100) * (level-1);
  return base * lvlBonus;
}
function spendStamina(kind){
  const cost = CONFIG.CLICK.staminaCost;
  state.stamina[kind] = Math.max(0, (state.stamina[kind]||0) - cost);
}
function staminaFactor(kind){
  return (state.stamina[kind]||0) >= CONFIG.CLICK.staminaCost ? 1 : 0.5;
}
function showFloat(i, text, crit=false){
  const board = document.getElementById('board');
  const el = board.children[i];
  const span = document.createElement('div');
  span.className = 'float-num' + (crit?' crit':'');
  span.textContent = text;
  el.appendChild(span);
  setTimeout(()=>{ span.remove(); }, 900);
}
function chargeRing(i, on){
  const board = document.getElementById('board');
  const el = board.children[i];
  let ring = el.querySelector('.charge-ring');
  if(on){
    if(!ring){
      ring = document.createElement('div'); ring.className='charge-ring';
      el.appendChild(ring);
    }
  } else {
    if(ring) ring.remove();
  }
}

export function handleClickDown(e){
  const el = e.currentTarget;
  const idx = parseInt(el.dataset.index,10);
  const kind = el.dataset.kind;
  if(!kind) return;
  holdMap.set(idx, performance.now());
  if(kind!=='house') chargeRing(idx, true);
}
export function handleClickUp(e){
  const el = e.currentTarget;
  const idx = parseInt(el.dataset.index,10);
  const kind = el.dataset.kind;
  if(!kind) return;
  const t0 = holdMap.get(idx) || performance.now();
  const held = performance.now() - t0;
  holdMap.delete(idx);
  chargeRing(idx,false);

  if(kind==='house' || kind==='tree' || kind==='rock') return;

  // kindKey already defined above
  const cost = CONFIG.CLICK.staminaCost;
  if((state.stamina[kindKey]||0) < cost){
    showFloat(idx, 'épuisé');
    return; // HARD STAMINA GATE
  }

  let mult = 1;
  if(held >= CONFIG.CLICK.holdMs) mult *= CONFIG.CLICK.holdMult;
  const crit = Math.random() < CONFIG.CLICK.critChance;
  if(crit) mult *= CONFIG.CLICK.critMult;

  // kindKey already defined above
  const per = perClick(kindKey) * staminaFactor(kindKey) * mult;

  if(kindKey==='castle'){ setState({ gold: state.gold + per }); upsertCastleCard(); showFloat(idx, `+${per.toFixed(2)} or`, crit); }
  else if(kindKey==='field'){ setState({ wheat: state.wheat + per }); upsertFieldsCard(); showFloat(idx, `+${per.toFixed(2)} blé`, crit); }
  else if(kindKey==='camp'){ setState({ wood: state.wood + per }); upsertCampsCard(); showFloat(idx, `+${per.toFixed(2)} bois`, crit); }
  else if(kindKey==='mine'){ setState({ stone: state.stone + per }); upsertMinesCard(); showFloat(idx, `+${per.toFixed(2)} pierre`, crit); }

  spendStamina(kindKey);
}
