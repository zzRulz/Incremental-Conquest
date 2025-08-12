import { CONFIG } from './config.js';
import { state, setState } from './state.js';
import { load } from './save.js';
import { initGrid, repaintFromState } from './grid.js';
import { initUI } from './ui.js';
import { initBuildings } from './buildings.js';
import { startTimers } from './timers.js';
import { upsertCastleCard, upsertHousesCard, upsertFieldsCard, upsertCampsCard, upsertMinesCard } from './panel.js';
import { placeNaturalResources } from './resources.js';

window.addEventListener('beforeunload', ()=>{
  try{ localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(state)); }catch(_){}
});

(function start(){
  load();
  initGrid();
  initUI();
  initBuildings();
  placeNaturalResources();
  repaintFromState();
  upsertCastleCard(); upsertHousesCard(); upsertFieldsCard(); upsertCampsCard(); upsertMinesCard();
  startTimers();
})();