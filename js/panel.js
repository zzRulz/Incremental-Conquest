import { state } from './state.js';
const left = document.getElementById('leftPanel');

export function clearPanel(){ left.innerHTML=''; }

function staminaWidth(key){ return Math.max(0, Math.min(100, state.stamina[key]||0)); }
function yieldPerClick(kind){
  const base = { castle: .1, field: .1, camp: .1, mine: .1 }[kind] || 0;
  const lvl = (kind==='castle') ? state.castleLevel : (state.levels[kind]||1);
  const bonus = 1 + 0.10 * (lvl-1);
  return (base * bonus).toFixed(2);
}

export function upsertCastleCard(){
  if(!state.castleBuilt){ const c=left.querySelector('[data-kind="castle"]'); if(c) c.remove(); return; }
  let card = left.querySelector('[data-kind="castle"]');
  if(!card){
    card=document.createElement('div'); card.className='building-card'; card.dataset.kind='castle';
    card.innerHTML = `<div class="building-name">🏰 Château</div>
    <div class="prod-label small"></div>
    <div class="prod-bar"><div class="prod-fill"></div></div>`;
    left.appendChild(card);
  }
  card.querySelector('.prod-label').textContent = `Niv ${state.castleLevel} • +${yieldPerClick('castle')} or / clic`;
  card.querySelector('.prod-fill').style.width = staminaWidth('castle') + '%';
}
export function upsertHousesCard(){
  if(state.houses<=0){ const c=left.querySelector('[data-kind="house"]'); if(c) c.remove(); return; }
  let card = left.querySelector('[data-kind="house"]');
  if(!card){
    card=document.createElement('div'); card.className='building-card'; card.dataset.kind='house';
    card.innerHTML = `<div class="building-name">🏠 Maisons × <span class="count">0</span></div>
    <div class="prod-label small">+1 pop / maison</div>
    <div class="prod-bar"><div class="prod-fill"></div></div>`;
    left.appendChild(card);
  }
  card.querySelector('.count').textContent = state.houses;
  card.querySelector('.prod-fill').style.width = '100%';
}
export function upsertFieldsCard(){
  if(state.fields<=0){ const c=left.querySelector('[data-kind="field"]'); if(c) c.remove(); return; }
  let card = left.querySelector('[data-kind="field"]');
  if(!card){
    card=document.createElement('div'); card.className='building-card'; card.dataset.kind='field';
    card.innerHTML = `<div class="building-name">🌾 Champs × <span class="count">0</span></div>
    <div class="prod-label small"></div>
    <div class="prod-bar"><div class="prod-fill"></div></div>`;
    left.appendChild(card);
  }
  card.querySelector('.count').textContent = state.fields;
  card.querySelector('.prod-label').textContent = `Niv ${state.levels.field} • +${yieldPerClick('field')} blé / clic`;
  card.querySelector('.prod-fill').style.width = staminaWidth('field') + '%';
}
export function upsertCampsCard(){
  if(state.camps<=0){ const c=left.querySelector('[data-kind="camp"]'); if(c) c.remove(); return; }
  let card = left.querySelector('[data-kind="camp"]');
  if(!card){
    card=document.createElement('div'); card.className='building-card'; card.dataset.kind='camp';
    card.innerHTML = `<div class="building-name">🪓 Camps × <span class="count">0</span></div>
    <div class="prod-label small"></div>
    <div class="prod-bar"><div class="prod-fill"></div></div>`;
    left.appendChild(card);
  }
  card.querySelector('.count').textContent = state.camps;
  card.querySelector('.prod-label').textContent = `Niv ${state.levels.camp} • +${yieldPerClick('camp')} bois / clic`;
  card.querySelector('.prod-fill').style.width = staminaWidth('camp') + '%';
}
export function upsertMinesCard(){
  if(state.mines<=0){ const c=left.querySelector('[data-kind="mine"]'); if(c) c.remove(); return; }
  let card = left.querySelector('[data-kind="mine"]');
  if(!card){
    card=document.createElement('div'); card.className='building-card'; card.dataset.kind='mine';
    card.innerHTML = `<div class="building-name">⛏️ Mines × <span class="count">0</span></div>
    <div class="prod-label small"></div>
    <div class="prod-bar"><div class="prod-fill"></div></div>`;
    left.appendChild(card);
  }
  card.querySelector('.count').textContent = state.mines;
  card.querySelector('.prod-label').textContent = `Niv ${state.levels.mine} • +${yieldPerClick('mine')} pierre / clic`;
  card.querySelector('.prod-fill').style.width = staminaWidth('mine') + '%';
}

export function refreshStaminaBars(){
  const map=[['castle','[data-kind="castle"]'],['house','[data-kind="house"]'],['field','[data-kind="field"]'],['camp','[data-kind="camp"]'],['mine','[data-kind="mine"]']];
  map.forEach(([k,sel])=>{
    const card = left.querySelector(sel); if(!card) return;
    const bar = card.querySelector('.prod-fill'); if(!bar) return;
    bar.style.width = (k==='house'?100:(state.stamina[k]||0)) + '%';
  });
}
