import { CONFIG } from './config.js';
import { setState } from './state.js';
import { load, save } from './save.js';
import { initGrid } from './grid.js';
import { initUI } from './ui.js';
import { initBuildings } from './buildings.js';
import { startTimers } from './timers.js';
import { clearPanel, upsertCastleCard, upsertHousesCard } from './panel.js';
window.addEventListener('beforeunload', save);
(function bootstrap(){
  setState({
    zoneRadius: CONFIG.GRID.startRadius,
    incomePerTick: 0,
  });
  load();
  initGrid();
  initUI();
  clearPanel();
  initBuildings();
  upsertCastleCard(); upsertHousesCard();
  startTimers();
  setInterval(save, 5000);
})();