import { CONFIG } from './config.js';
import { state, setState } from './state.js';
import { refreshAll } from './panel.js';

let holdMap = new Map();

function getMult(kind){
  const ev = state.event.mult[kind] || 1;
  const zone = state.zoneBonus[kind] || 1;
  const tech = (state.techBonus[kind] || 1);
  const art  = (state.artBonus[kind] || 1);
  return state.globalMult * ev * zone * tech * art;
}
function perClick(kind){
  const base = CONFIG.CLICK.base[kind] || 0;
  const level = (kind==='castle') ? state.castleLevel : (state.levels[kind]||1);
  const lvlBonus = 1 + (CONFIG.CLICK.levelBonusPct/100) * (level-1);
  return base * lvlBonus * getMult(kind);
}
function spendStamina(kind){
  const cost = CONFIG.CLICK.staminaCost;
  state.stamina[kind] = Math.max(0, (state.stamina[kind]||0) - cost);
  refreshAll();
}
function showFloat(i, text, cls=''){
  const board = document.getElementById('board');
  const el = board.children[i];
  const span = document.createElement('div');
  span.className = 'float-num ' + cls;
  span.textContent = text;
  el.appendChild(span);
  setTimeout(()=>{ span.remove(); }, 900);
}
function chargeRing(i, on){
  const board = document.getElementById('board');
  const el = board.children[i];
  let ring = el.querySelector('.charge-ring');
  if(on){ if(!ring){ ring = document.createElement('div'); ring.className='charge-ring'; el.appendChild(ring); } }
  else { if(ring) ring.remove(); }
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

  if(kind==='house' || kind==='tree' || kind==='rock' || kind==='boss') return;

  const staminaKey = (kind==='field'||kind==='camp'||kind==='mine'||kind==='castle')?kind:(kind==='mill'?'mill':null);
  if(staminaKey && (state.stamina[staminaKey]||0) < CONFIG.CLICK.staminaCost){ showFloat(idx, 'épuisé'); return; }

  let mult = 1;
  if(held >= CONFIG.CLICK.holdMs) mult *= CONFIG.CLICK.holdMult;
  const critChance = CONFIG.CLICK.critChance + (state.achievements['critPlus']?0.02:0);
  const crit = Math.random() < critChance;
  if(crit) mult *= CONFIG.CLICK.critMult;

  if(kind==='castle'){
    const v = perClick('castle') * mult;
    setState({ gold: state.gold + v, totals: {...state.totals, gold: state.totals.gold + v }, clicks: {...state.clicks, castle: state.clicks.castle+1} });
    showFloat(idx, `+${v.toFixed(2)} or`, crit?'crit':'');
    spendStamina('castle');
  } else if(kind==='field'){
    const v = perClick('field') * mult;
    setState({ wheat: state.wheat + v, totals: {...state.totals, wheat: state.totals.wheat + v }, clicks: {...state.clicks, field: state.clicks.field+1} });
    showFloat(idx, `+${v.toFixed(2)} blé`, crit?'crit':'');
    spendStamina('field');
  } else if(kind==='camp'){
    const v = perClick('camp') * mult;
    setState({ wood: Math.min(state.woodCap, state.wood + v), totals: {...state.totals, wood: state.totals.wood + v }, clicks: {...state.clicks, camp: state.clicks.camp+1} });
    showFloat(idx, `+${v.toFixed(2)} bois`, crit?'crit':'');
    spendStamina('camp');
  } else if(kind==='mine'){
    const v = perClick('mine') * mult;
    setState({ stone: Math.min(state.stoneCap, state.stone + v), totals: {...state.totals, stone: state.totals.stone + v }, clicks: {...state.clicks, mine: state.clicks.mine+1} });
    showFloat(idx, `+${v.toFixed(2)} pierre`, crit?'crit':'');
    spendStamina('mine');
  } else if(kind==='mill'){
    if(state.wheat < 1){ showFloat(idx, 'blé manquant'); return; }
    const g = 0.8 * mult;
    setState({ wheat: state.wheat - 1, gold: state.gold + g });
    showFloat(idx, `-1 blé → +${g.toFixed(2)} or`);
  } else if(kind==='library'){
    let v = 0.1 * mult;
    if(state.artBonus['sciencePlus']) v += 1; // +1 science/clic via artefact
    setState({ science: state.science + v, totals: {...state.totals, science: state.totals.science + v }, clicks: {...state.clicks, library: state.clicks.library+1} });
    showFloat(idx, `+${v.toFixed(2)} sci`);
  }

  refreshAll();
}
