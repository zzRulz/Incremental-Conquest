import { CONFIG } from './config.js';
import { state, setState } from './state.js';

const banner = document.getElementById('eventBanner');

export function startEvents(){
  // set initial
  banner.textContent = state.event.label;
  setInterval(tickEvent, 1000);
  setInterval(()=>{ // maybe start a new event sometimes
    if(state.event.timeLeft>0) return;
    if(Math.random()<0.4){
      const ev = CONFIG.EVENTS[Math.floor(Math.random()*CONFIG.EVENTS.length)];
      startEvent(ev);
    }
  }, 15000);
}

export function startEvent(ev){
  state.event.id = ev.id;
  state.event.label = ev.label;
  state.event.timeLeft = ev.dur;
  state.event.mult = ev.mult || {};
  state.event.marketBonus = ev.market || 0;
  setState({ event: state.event });
  banner.textContent = `${ev.label} (${state.event.timeLeft}s)`;
}
function tickEvent(){
  if(state.event.timeLeft>0){
    state.event.timeLeft -= 1;
    if(state.event.timeLeft<=0){
      // reset
      state.event = { id:null, label:'Aucun événement', timeLeft:0, mult:{}, marketBonus:0 };
      setState({ event: state.event });
      banner.textContent = state.event.label;
    } else {
      banner.textContent = `${state.event.label} (${state.event.timeLeft}s)`;
    }
  }
}
