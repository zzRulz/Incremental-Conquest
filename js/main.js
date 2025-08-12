import { CONFIG } from './config.js';
import { state, setState } from './state.js';
import { load } from './save.js';
import { initGrid, repaintFromState } from './grid.js';
import { initUI } from './ui.js';
import { initBuildings } from './modules/buildings.js';
import { initForeman } from './modules/foreman.js';
import { startTimers } from './timers.js';
import { refreshAll } from './panel.js';
import { placeNaturalResources } from './resources.js';
import { initPrestige } from './prestige.js';
import { initQuests } from './quests.js';
import { checkAchievements } from './achievements.js';
import { initZones } from './modules/zones.js';
import { initArtifacts } from './modules/artifacts.js';
import { initTech } from './modules/tech.js';

window.addEventListener('beforeunload', ()=>{
  try{ localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(state)); }catch(_){}
});

(function start(){
  load();
  setState({ woodCap: CONFIG.STORAGE.woodCap, stoneCap: CONFIG.STORAGE.stoneCap });
  initGrid();
  initUI();
  initBuildings();
  initForeman();
  initPrestige();
  initQuests();
  initZones();
  initArtifacts();
  initTech();
  placeNaturalResources();
  repaintFromState();
  refreshAll();
  checkAchievements();
  startTimers();
})();