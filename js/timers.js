import { CONFIG } from './config.js';
import { state, setState, on } from './state.js';
import { beep } from './sound.js';
import { upsertCastleCard, upsertHousesCard, upsertFieldsCard, upsertCampsCard, upsertMinesCard, upsertWarehousesCard } from './panel.js';
import { setZzz, clearZzz } from './resources.js';

let goldTimer=null, resTimer=null;

export function startTimers(){
  // Only keep autosave, stamina regen, and foreman automation
  setInterval(()=>{ try{ window.save && window.save(); }catch(_){ } }, 5000);
  setInterval(()=>{
    const max=CONFIG.CLICK.staminaMax, regen=CONFIG.CLICK.staminaRegenPerSec;
    state.stamina.castle = Math.min(max, (state.stamina.castle||0)+regen);
    state.stamina.field  = Math.min(max, (state.stamina.field||0)+regen);
    state.stamina.camp   = Math.min(max, (state.stamina.camp||0)+regen);
    state.stamina.mine   = Math.min(max, (state.stamina.mine||0)+regen);
  }, 1000);
  setInterval(()=>{
    if(!state.foremanBuilt || !state.foremanOn) return;
    const clicksPerSec = CONFIG.FOREMAN.speedPerLevel * Math.max(1, state.foremanLevel||1);
    // wheat consumption: 5 per minute
    const consumePerSec = 5/60;
    if(state.wheat < consumePerSec){ return; }
    // pay
    setState({ wheat: state.wheat - consumePerSec });
    // naive: one click each on all producers per second
    const board = document.getElementById('board');
    const toClick = [...state.fieldPositions, ...state.campPositions, ...state.minePositions];
    toClick.forEach(i=>{
      const el = board.children[i];
      if(!el) return;
      el.dispatchEvent(new Event('mouseup')); // simulate quick click
    });
    // castle too
    if(state.castleBuilt){
      const cc = document.getElementById('centerCell');
      if(cc) cc.dispatchEvent(new Event('mouseup'));
    }
  }, 1000);
}
