// Left grouped panel
import { state } from './state.js';
import { CONFIG } from './config.js';
const left = document.getElementById('leftPanel');
export function upsertCastleCard(){
  let card = left.querySelector('[data-kind="castle"]');
  if(!card){
    card = document.createElement('div');
    card.className = 'building-card';
    card.dataset.kind = 'castle';
    card.innerHTML = `
      <div class="building-name">🏰 Château</div>
      <div class="prod-label small"></div>
      <div class="prod-bar"><div class="prod-fill"></div></div>
    `;
    left.appendChild(card);
  }
  const lbl = card.querySelector('.prod-label');
  lbl.textContent = `+${state.castleLevel} or / ${state.mode==='debug'?'2s':'60s'}`;
  animateBar(card.querySelector('.prod-fill'), state.mode==='debug'?2000:60000);
}
export function upsertHousesCard(){
  let card = left.querySelector('[data-kind="house"]');
  if(!card){
    card = document.createElement('div');
    card.className = 'building-card';
    card.dataset.kind = 'house';
    card.innerHTML = `
      <div class="building-name">🏠 Maisons × <span class="count">0</span></div>
      <div class="prod-label small"></div>
      <div class="prod-bar"><div class="prod-fill consume"></div></div>
    `;
    left.appendChild(card);
  }
  card.querySelector('.count').textContent = state.houses;
  const upkeep = (CONFIG.HOUSE.upkeepPerTick * state.houses);
  card.querySelector('.prod-label').textContent = `Entretien −${upkeep} or / ${state.mode==='debug'?'2s':'60s'}`;
  animateConsume(card.querySelector('.prod-fill'), state.mode==='debug'?2000:60000);
}
function animateBar(fill, dur){
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
export function clearPanel(){ left.innerHTML=''; }
