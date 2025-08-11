import { state, setState } from './state.js';
import { CONFIG } from './config.js';
export function recalcIncome(){
  // income = castleLevel - 0.5 * houses
  const income = (state.castleBuilt ? state.castleLevel : 0) - (CONFIG.HOUSE.upkeepPerTick * state.houses);
  setState({ incomePerTick: round2(income) });
}
function round2(x){ return Math.round(x*100)/100; }
