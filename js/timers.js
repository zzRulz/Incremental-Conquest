import { CONFIG } from './config.js';
import { state, setState } from './state.js';
import { refreshAll } from './panel.js';
import { checkAchievements } from './achievements.js';
import { save } from './save.js';
import { tickMarketDrift } from './buildings.js';
import { setDepletedClass } from './grid.js';
import { startEvent, startEvents } from './events.js';

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
  // events
  startEvents();
  // foreman automation tick (10 Hz scheduler, act per cps)
  let acc = 0;
  setInterval(()=>{
    if(!state.foreman.built || !state.foreman.on) return;
    const cps = state.foreman.clicksPerSec;
    acc += 0.1 * cps;
    // wheat consumption
    const consumePerTick = (state.foreman.wheatPerMin / 60) * 0.1;
    if(state.wheat < consumePerTick){ return; }
    state.wheat -= consumePerTick;
    setState({ wheat: state.wheat });
    // do integer clicks
    const board = document.getElementById('board');
    while(acc >= 1){
      acc -= 1;
      // choose a producer round-robin
      const producers = [];
      if(state.castleBuilt) producers.push(document.getElementById('centerCell'));
      [...state.fieldPositions, ...state.campPositions, ...state.minePositions].forEach(i=> producers.push(board.children[i]));
      if(producers.length===0) break;
      const el = producers[Math.floor(Math.random()*producers.length)];
      el && el.dispatchEvent(new Event('mouseup'));
    }
  }, 100);
}
