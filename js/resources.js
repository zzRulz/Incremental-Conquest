import { state } from './state.js';
import { CONFIG } from './config.js';
import { getRandomFreeCell, placeEmoji, occupy } from './grid.js';

export function placeNaturalResources(){
  // Trees: prestige 2 => 1 tree, then +1 every 2 prestiges
  const trees = state.prestige >= 2 ? (1 + Math.floor((state.prestige - 2) / 2)) : 0;
  const rocks = Math.floor(state.prestige / 3);
  state.treePositions = []; state.rockPositions = [];
  for(let n=0;n<trees;n++){ const i=getRandomFreeCell(true); if(i===null) break; state.treePositions.push(i); placeEmoji(i,'🌳','tree'); occupy(i); }
  for(let n=0;n<rocks;n++){ const i=getRandomFreeCell(true); if(i===null) break; state.rockPositions.push(i); placeEmoji(i,'🪨','rock'); occupy(i); }
}
