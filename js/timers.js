import { CONFIG } from './config.js';
import { state, setState } from './state.js';
import { refreshAll } from './panel.js';
import { checkAchievements } from './achievements.js';
import { save } from './save.js';
import { tickMarketDrift } from './buildings.js';
import { setDepletedClass } from './grid.js';

export function startTimers(){
  setInterval(()=>{ try{ save(); }catch(_){} }, 5000);
  // stamina regen
  setInterval(()=>{
    const max=CONFIG.CLICK.staminaMax, regen=CONFIG.CLICK.staminaRegenPerSec;
    state.stamina.castle = Math.min(max, (state.stamina.castle||0)+regen);
    state.stamina.field  = Math.min(max, (state.stamina.field||0)+regen);
    state.stamina.camp   = Math.min(max, (state.stamina.camp||0)+regen);
    state.stamina.mine   = Math.min(max, (state.stamina.mine||0)+regen);
    refreshAll();
  }, 1000);
  // achievements
  setInterval(checkAchievements, 1500);
  // market drift
  setInterval(tickMarketDrift, 4000);
  // refresh depleted class safety
  setInterval(setDepletedClass, 1000);
}
