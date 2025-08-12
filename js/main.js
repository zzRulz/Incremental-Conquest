import { CONFIG } from './config.js';
import { state, setState } from './state.js';
import { load, save } from './save.js';
import { initGrid, repaintFromState } from './grid.js';
import { initUI } from './ui.js';
import { initBuildings } from './buildings.js';
import { startTimers } from './timers.js';
import { upsertCastleCard, upsertHousesCard, upsertFieldsCard, upsertCampsCard, upsertMinesCard } from './panel.js';
import { placeNaturalResources } from './resources.js';

window.addEventListener('beforeunload', save);

(function start(){
  setState({
    woodCap: CONFIG.STORAGE.woodCap,
    stoneCap: CONFIG.STORAGE.stoneCap,
    incomePerTick: 0,
  });
  load();
  initGrid();
  initUI();
  initBuildings();
  placeNaturalResources();
  repaintFromState();
  upsertCastleCard(); upsertHousesCard(); upsertFieldsCard(); upsertCampsCard(); upsertMinesCard();
  startTimers();
  setInterval(save, 5000);
})();
