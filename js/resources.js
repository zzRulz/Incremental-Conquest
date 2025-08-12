import { state } from './state.js';
import { getRandomFreeCell, placeEmoji, occupy } from './grid.js';

export function placeNaturalResources(){
  // prestige 0: no trees, no rocks
  state.treePositions = []; state.rockPositions = [];
  // ready for future (prestige rules)
}
