import { CONFIG } from './config.js';
import { state, setState } from './state.js';
export function save(){
  const data = {
    gold: state.gold,
    pop: state.pop,
    zoneRadius: state.zoneRadius,
    mode: state.mode,
    muted: state.muted,
    castleBuilt: state.castleBuilt,
    castleLevel: state.castleLevel,
    houses: state.houses,
    incomePerTick: state.incomePerTick,
    occupied: state.occupied,
    housePositions: state.housePositions,
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