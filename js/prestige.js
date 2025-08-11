import { state, setState } from './state.js';
import { clearPanel } from './panel.js';
import { placeNaturalResources } from './resources.js';
import { initGrid } from './grid.js';
import { recalcIncome } from './economy.js';

export function doPrestige(){
  if(!(state.castleBuilt && state.castleLevel>=10)) return;
  if(!confirm('Prestige ? +5% prod globale. Réinitialise la partie.')) return;
  const newPrest = state.prestige + 1;
  // reset
  const keep = { mode: state.mode, muted: state.muted };
  setState({
    gold: 0, wood: 0, stone: 0, pop: 0,
    woodCap: 10, stoneCap: 10, warehouses: 0,
    zoneRadius: 2,
    castleBuilt: false, castleLevel: 1,
    houses: 0, fields: 0, camps: 0, mines: 0,
    incomePerTick: 0,
    occupied: [], housePositions: [], fieldPositions: [], campPositions: [], minePositions: [],
    treePositions: [], rockPositions: [],
    firstHouse: false,
    prestige: newPrest,
    ...keep
  });
  clearPanel();
  initGrid(); // rebuild visuals
  placeNaturalResources();
  recalcIncome();
}
