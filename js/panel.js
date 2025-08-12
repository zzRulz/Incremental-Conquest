import { state, setState } from './state.js';
import { CONFIG } from './config.js';
import { setDepletedClass } from './grid.js';

const left = document.getElementById('leftPanel');

export function clearPanel(){ left.innerHTML=''; }

function getMult(kind){
  const ev = state.event.mult[kind] || 1;
  const zone = state.zoneBonus[kind] || 1;
  const tech = (state.techBonus[kind] || 1);
  const art  = (state.artBonus[kind] || 1);
  return state.globalMult * ev * zone * tech * art;
}
function staminaWidth(key){ return Math.max(0, Math.min(100, state.stamina[key]||0)); }
function yieldPerClick(kind){
  const base = { castle: .1, field: .1, camp: .1, mine: .1 }[kind] || 0;
  const lvl = (kind==='castle') ? state.castleLevel : (state.levels[kind]||1);
  const bonus = 1 + 0.10 * (lvl-1);
  return (base * bonus * getMult(kind)).toFixed(2);
}
function costForUpgrade(kind){
  const lvl = (kind==='castle')? state.castleLevel : state.levels[kind];
  return Math.ceil(5 * Math.pow(1.35, (lvl-1)));
}

function upsert(kind, icon, title, usesStamina){
  let selector = `[data-kind="${kind}"]`;
  let card = left.querySelector(selector);
  if(kind!=='house'){
    const hasAny = (kind==='castle') ? state.castleBuilt : (state[kind+'s']>0);
    if(!hasAny){ if(card) card.remove(); return; }
  } else {
    if(state.houses<=0){ if(card) card.remove(); return; }
  }
  if(!card){
    card=document.createElement('div'); card.className='building-card'; card.dataset.kind=kind;
    card.innerHTML = `<div class="building-name">${icon} ${title} <span class="count"></span></div>
    <div class="prod-label small"></div>
    <div class="prod-bar"><div class="prod-fill"></div></div>
    ${kind!=='house'?'<div class="row"><button class="btn upg">Améliorer</button><span class="small muted tips"></span></div>':''}`;
    left.appendChild(card);
    if(kind!=='house'){
      card.querySelector('.upg').addEventListener('click', ()=>{
        const lvl = (kind==='castle')? state.castleLevel : state.levels[kind];
        const cost = costForUpgrade(kind);
        if(state.gold < cost){ card.querySelector('.tips').textContent = `Coût: ${cost} or`; return; }
        setState({ gold: state.gold - cost });
        if(kind==='castle'){ setState({ castleLevel: state.castleLevel+1 }); }
        else { state.levels[kind] = lvl+1; setState({ levels: state.levels }); }
        card.querySelector('.tips').textContent = `Niv ${lvl+1}`;
        refreshAll();
      });
    }
  }
  const count = (kind==='castle')?'':`× ${(kind==='house')?state.houses:state[kind+'s']}`;
  card.querySelector('.count').textContent = count;
  if(kind==='house'){ card.querySelector('.prod-label').textContent = `+1 pop / maison`; }
  else if(kind==='castle'){ card.querySelector('.prod-label').textContent = `Niv ${state.castleLevel} • +${yieldPerClick('castle')} or / clic`; }
  else if(kind==='field'){ card.querySelector('.prod-label').textContent = `Niv ${state.levels.field} • +${yieldPerClick('field')} blé / clic`; }
  else if(kind==='camp'){ card.querySelector('.prod-label').textContent = `Niv ${state.levels.camp} • +${yieldPerClick('camp')} bois / clic`; }
  else if(kind==='mine'){ card.querySelector('.prod-label').textContent = `Niv ${state.levels.mine} • +${yieldPerClick('mine')} pierre / clic`; }
  const bar = card.querySelector('.prod-fill');
  bar.style.width = usesStamina ? staminaWidth(kind) + '%' : '100%';
}

export function upsertCastleCard(){ upsert('castle','🏰','Château', true); }
export function upsertHousesCard(){ upsert('house','🏠','Maisons', false); }
export function upsertFieldsCard(){ upsert('field','🌾','Champs', true); }
export function upsertCampsCard(){ upsert('camp','🪓','Camps', true); }
export function upsertMinesCard(){ upsert('mine','⛏️','Mines', true); }

export function refreshAll(){
  upsertCastleCard(); upsertHousesCard(); upsertFieldsCard(); upsertCampsCard(); upsertMinesCard();
  setDepletedClass();
}
