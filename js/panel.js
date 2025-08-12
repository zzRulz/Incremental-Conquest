import { state } from './state.js';
const left = document.getElementById('leftPanel');

export function clearPanel(){ left.innerHTML=''; }
export function updateStaminaBars(){
  const map=[['castle','[data-kind="castle"]'],['house','[data-kind="house"]'],['field','[data-kind="field"]'],['camp','[data-kind="camp"]'],['mine','[data-kind="mine"]']];
  map.forEach(([k,sel])=>{
    const card = left.querySelector(sel); if(!card) return;
    const bar = card.querySelector('.prod-fill'); if(!bar) return;
    const val = (k==='house')?100:(state.stamina[k]||0);
    bar.style.width = Math.max(0, Math.min(100, val)) + '%';
  });
}


export function upsertCastleCard(){
  let card = left.querySelector('[data-kind="castle"]');
  if(!card){
    card=document.createElement('div'); card.className='building-card'; card.dataset.kind='castle';
    card.innerHTML = `<div class="building-name">🏰 Château</div>
    <div class="prod-label small"></div>
    <div class="prod-bar"><div class="prod-fill"></div></div>`;
    left.appendChild(card);
  }
  card.querySelector('.prod-label').textContent = `+${state.castleLevel} or / ${state.mode==='debug'?'2s':'60s'} (+${state.prestige*5}%)`;
  updateStaminaBars();
}
export function upsertHousesCard(){
  if(state.houses<=0){ const c=left.querySelector('[data-kind="house"]'); if(c) c.remove(); return; } /* FIX: hide if none */
  let card = left.querySelector('[data-kind="house"]');
  if(!card){
    card=document.createElement('div'); card.className='building-card'; card.dataset.kind='house';
    card.innerHTML = `<div class="building-name">🏠 Maisons × <span class="count">0</span></div>
    <div class="prod-label small"></div>
    <div class="prod-bar"><div class="prod-fill consume"></div></div>`;
    left.appendChild(card);
  }
  card.querySelector('.count').textContent = state.houses;
  const upkeep = 0.5*state.houses;
  card.querySelector('.prod-label').textContent = `Entretien −${upkeep} or / ${state.mode==='debug'?'2s':'60s'}`;
  updateStaminaBars();
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
  const prod = 0.5*state.fields;
  card.querySelector('.prod-label').textContent = `+${prod} or / ${state.mode==='debug'?'2s':'60s'} (+${state.prestige*5}%)`;
  updateStaminaBars();
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
  card.querySelector('.prod-label').textContent = `+${state.camps} bois / ${state.mode==='debug'?'2s':'30s'} (+${state.prestige*5}%)`;
  updateStaminaBars();
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
  card.querySelector('.prod-label').textContent = `+${state.mines} pierre / ${state.mode==='debug'?'2s':'30s'} (+${state.prestige*5}%)`;
  updateStaminaBars();
}
export function upsertWarehousesCard(){
  if(state.warehouses<=0){ const c=left.querySelector('[data-kind="ware"]'); if(c) c.remove(); return; }
  let card = left.querySelector('[data-kind="ware"]');
  if(!card){
    card=document.createElement('div'); card.className='building-card'; card.dataset.kind='ware';
    card.innerHTML = `<div class="building-name">🏚️ Entrepôts × <span class="count">0</span></div>
    <div class="prod-label small"></div>`;
    left.appendChild(card);
  }
  card.querySelector('.count').textContent = state.warehouses;
  card.querySelector('.prod-label').textContent = `Capacité bois/pierre: ${state.woodCap}/${state.stoneCap}`;
}
function animateFill(fill, dur){
  fill.style.transition='none'; fill.style.width='0%';
  setTimeout(()=>{ fill.style.transition=`width ${dur}ms linear`; fill.style.width='100%'; },30);
  if (fill._i) clearInterval(fill._i);
  fill._i = setInterval(()=>{
    fill.style.transition='none'; fill.style.width='0%';
    setTimeout(()=>{ fill.style.transition=`width ${dur}ms linear`; fill.style.width='100%'; },30);
  }, dur);
}
function animateConsume(fill, dur){
  fill.style.transition='none'; fill.style.transform='scaleX(0)';
  setTimeout(()=>{ fill.style.transition=`transform ${dur}ms linear`; fill.style.transform='scaleX(1)'; },30);
  if (fill._i) clearInterval(fill._i);
  fill._i = setInterval(()=>{
    fill.style.transition='none'; fill.style.transform='scaleX(0)';
    setTimeout(()=>{ fill.style.transition=`transform ${dur}ms linear`; fill.style.transform='scaleX(1)'; },30);
  }, dur);
}
