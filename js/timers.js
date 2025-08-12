import { save } from './save.js';
import { CONFIG } from './config.js';
import { state, setState } from './state.js';

export function startTimers(){
  setInterval(()=>{ try{ save(); }catch(_){ } }, 5000);
  // stamina regen
  setInterval(()=>{
    const max=CONFIG.CLICK.staminaMax, regen=CONFIG.CLICK.staminaRegenPerSec;
    state.stamina.castle = Math.min(max, (state.stamina.castle||0)+regen);
    state.stamina.field  = Math.min(max, (state.stamina.field||0)+regen);
    state.stamina.camp   = Math.min(max, (state.stamina.camp||0)+regen);
    state.stamina.mine   = Math.min(max, (state.stamina.mine||0)+regen);
  }, 1000);

  // foreman automations (1x/s) + wheat consumption 5/min
  setInterval(()=>{
    if(!state.foremanBuilt || !state.foremanOn) return;
    const consumePerSec = 5/60;
    if(state.wheat < consumePerSec){ return; }
    setState({ wheat: state.wheat - consumePerSec });
    const board = document.getElementById('board');
    const toClick = [...state.fieldPositions, ...state.campPositions, ...state.minePositions];
    toClick.forEach(i=>{
      const el = board.children[i];
      if(!el) return;
      el.dispatchEvent(new Event('mouseup'));
    });
    // also castle
    if(state.castleBuilt){
      const cc = document.getElementById('centerCell');
      if(cc) cc.dispatchEvent(new Event('mouseup'));
    }
  }, 1000);
}
