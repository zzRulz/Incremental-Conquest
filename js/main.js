import { CONFIG } from './config.js';
import { setState, state } from './state.js';
import { load, save } from './save.js';
import { initGrid } from './grid.js';
import { initUI, updatePrestigeButton } from './ui.js';
import { initBuildings } from './buildings.js';
import { startTimers } from './timers.js';
import { clearPanel, upsertCastleCard, upsertHousesCard, upsertFieldsCard, upsertCampsCard, upsertMinesCard, upsertWarehousesCard } from './panel.js';
import { placeNaturalResources } from './resources.js';
import { doPrestige } from './prestige.js';
import { recalcIncome } from './economy.js';

window.addEventListener('beforeunload', save);
window.gamePrestige = doPrestige;
window.updatePrestigeButton = updatePrestigeButton;

(function bootstrap(){
  setState({
    zoneRadius: CONFIG.GRID.startRadius,
    woodCap: CONFIG.STORAGE.woodCap,
    stoneCap: CONFIG.STORAGE.stoneCap,
    incomePerTick: 0,
  });
  load();
  initGrid();
  initUI();
  clearPanel();
  initBuildings();
  upsertCastleCard(); upsertHousesCard(); upsertFieldsCard(); upsertCampsCard(); upsertMinesCard(); upsertWarehousesCard();
  placeNaturalResources(); // based on current prestige
  recalcIncome();
  startTimers();
  setInterval(save, 5000);
})();