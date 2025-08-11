import { CONFIG } from './config.js';
import { state, setState, on } from './state.js';
import { beep } from './sound.js';
import { upsertCastleCard, upsertHousesCard } from './panel.js';
let goldTimer = null;
export function startTimers(){
  restartGold();
  on('state:changed', (s)=>{
    if (s.mode==='debug' && goldTimer && goldTimer._mode!=='debug') restartGold();
    if (s.mode==='normal' && goldTimer && goldTimer._mode!=='normal') restartGold();
    // refresh left bars on mode change or counts
    upsertCastleCard();
    upsertHousesCard();
  });
}
function restartGold(){
  if (goldTimer) clearInterval(goldTimer);
  const interval = (state.mode==='debug') ? CONFIG.TICKS.goldDebug : CONFIG.TICKS.goldNormal;
  goldTimer = setInterval(()=>{
    if (!state.castleBuilt) return;
    const g = state.gold + state.incomePerTick;
    setState({ gold: g });
    const center = document.getElementById('centerCell');
    if (center){
      const fx = document.createElement('div');
      fx.className='gold-float'; fx.textContent = `${state.incomePerTick>=0?'+':''}${Math.round(state.incomePerTick*100)/100}`;
      fx.style.color = state.incomePerTick>=0 ? 'gold' : '#ff9a9a';
      center.appendChild(fx); setTimeout(()=>fx.remove(), 1000);
    }
    beep(880, 0.08);
  }, interval);
  goldTimer._mode = state.mode;
}
