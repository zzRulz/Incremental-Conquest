import { CONFIG } from './config.js';
import { state, setState, on } from './state.js';
import { beep } from './sound.js';
import { upsertCastleCard, upsertHousesCard, upsertFieldsCard, upsertCampsCard, upsertMinesCard, upsertWarehousesCard } from './panel.js';
import { setZzz, clearZzz } from './resources.js';

let goldTimer=null, resTimer=null;

export function startTimers(){
  restartGold(); restartRes();
  on('state:changed', (s)=>{
    const modeDurGold = s.mode==='debug'?CONFIG.TICKS.goldDebug:CONFIG.TICKS.goldNormal;
    const modeDurRes = s.mode==='debug'?CONFIG.TICKS.resDebug:CONFIG.TICKS.resNormal;
    if (goldTimer && goldTimer._dur!==modeDurGold) restartGold();
    if (resTimer && resTimer._dur!==modeDurRes) restartRes();
    // refresh left bars
    upsertCastleCard(); upsertHousesCard(); upsertFieldsCard(); upsertCampsCard(); upsertMinesCard(); upsertWarehousesCard();
  });
}

function restartGold(){
  if (goldTimer) clearInterval(goldTimer);
  const interval = state.mode==='debug'?CONFIG.TICKS.goldDebug:CONFIG.TICKS.goldNormal;
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
  goldTimer._dur = interval;
}

function restartRes(){
  if (resTimer) clearInterval(resTimer);
  const interval = state.mode==='debug'?CONFIG.TICKS.resDebug:CONFIG.TICKS.resNormal;
  resTimer = setInterval(()=>{
    const mult = 1 + 0.05*state.prestige;
    // wood
    if(state.camps>0){
      if(state.wood < state.woodCap){ state.wood = Math.min(state.woodCap, state.wood + 1*mult); clearZzz('camp'); }
      else setZzz('camp');
    }
    // stone
    if(state.mines>0){
      if(state.stone < state.stoneCap){ state.stone = Math.min(state.stoneCap, state.stone + 1*mult); clearZzz('mine'); }
      else setZzz('mine');
    }
    setState({ wood: state.wood, stone: state.stone });
  }, interval);
  resTimer._dur = interval;
}
