import { CONFIG } from './config.js';
import { state } from './state.js';
import { refreshStaminaBars } from './panel.js';
import { save } from './save.js';

export function startTimers(){
  setInterval(()=>{ try{ save(); }catch(_){} }, 5000);
  setInterval(()=>{
    const max=CONFIG.CLICK.staminaMax, regen=CONFIG.CLICK.staminaRegenPerSec;
    state.stamina.castle = Math.min(max, (state.stamina.castle||0)+regen);
    state.stamina.field  = Math.min(max, (state.stamina.field||0)+regen);
    state.stamina.camp   = Math.min(max, (state.stamina.camp||0)+regen);
    state.stamina.mine   = Math.min(max, (state.stamina.mine||0)+regen);
    refreshStaminaBars();
  }, 1000);
}
