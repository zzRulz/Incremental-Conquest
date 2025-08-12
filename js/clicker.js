import { CONFIG } from './config.js';
import { state, setState } from './state.js';
import { upsertCastleCard, upsertFieldsCard, upsertCampsCard, upsertMinesCard, refreshStaminaBars } from './panel.js';

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
  refreshStaminaBars();
}
function showFloat(i, text, crit=false, depleted=false){
  const board = document.getElementById('board');
  const el = board.children[i];
  const span = document.createElement('div');
  span.className = 'float-num' + (crit?' crit':'') + (depleted?' depleted':'');
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
  if(kind!=='house' && kind!=='tree' && kind!=='rock') chargeRing(idx, true);
  holdMap.set(idx, performance.now());
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

  const kindKey = (kind==='field'?'field': kind==='camp'?'camp': kind==='mine'?'mine':'castle');
  const cost = CONFIG.CLICK.staminaCost;
  if((state.stamina[kindKey]||0) < cost){
    showFloat(idx, 'épuisé', false, true);
    return;
  }

  let mult = 1;
  if(held >= CONFIG.CLICK.holdMs) mult *= CONFIG.CLICK.holdMult;
  const crit = Math.random() < CONFIG.CLICK.critChance;
  if(crit) mult *= CONFIG.CLICK.critMult;

  const per = perClick(kindKey) * mult;

  if(kindKey==='castle'){ setState({ gold: state.gold + per }); upsertCastleCard(); showFloat(idx, `+${per.toFixed(2)} or`, crit); }
  else if(kindKey==='field'){ setState({ wheat: state.wheat + per }); upsertFieldsCard(); showFloat(idx, `+${per.toFixed(2)} blé`, crit); }
  else if(kindKey==='camp'){ setState({ wood: Math.min(state.woodCap, state.wood + per) }); upsertCampsCard(); showFloat(idx, `+${per.toFixed(2)} bois`, crit); }
  else if(kindKey==='mine'){ setState({ stone: Math.min(state.stoneCap, state.stone + per) }); upsertMinesCard(); showFloat(idx, `+${per.toFixed(2)} pierre`, crit); }

  spendStamina(kindKey);
}
