import { CONFIG } from './config.js';
import { state, setState } from './state.js';
export function recalcIncome(){
  const castle = state.castleBuilt ? state.castleLevel : 0;
  const fields = state.fields * CONFIG.FIELD.goldPerTick;
  const houses = state.houses * CONFIG.HOUSE.upkeepPerTick;
  const income = (castle + fields - houses) * (1 + 0.05*state.prestige);
  setState({ incomePerTick: round2(income) });
}
function round2(x){ return Math.round(x*100)/100; }
