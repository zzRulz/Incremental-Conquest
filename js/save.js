import { CONFIG } from './config.js';
import { state, setState } from './state.js';
export function save(){
  const data = {
    gold: state.gold,
    zoneRadius: state.zoneRadius,
    castleBuilt: state.castleBuilt,
    incomePerTick: state.incomePerTick,
    mode: state.mode,
    muted: state.muted,
    v: 1
  };
  try{ localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(data)); }catch(e){}
}
export function load(){
  const raw = localStorage.getItem(CONFIG.SAVE_KEY);
  if(!raw) return false;
  try{
    const s = JSON.parse(raw);
    if (s.v !== 1) return false;
    setState(s);
    return true;
  }catch(e){ return false; }
}