const listeners = new Map();
export function on(evt, cb){ if(!listeners.has(evt)) listeners.set(evt, new Set()); listeners.get(evt).add(cb); }
export function emit(evt, payload){ (listeners.get(evt)||[]).forEach(cb=>cb(payload)); }

export const state = {
  gold: 0, wood: 0, stone: 0, pop: 0,
  woodCap: 10, stoneCap: 10, warehouses: 0,
  zoneRadius: 2, mode: 'debug', muted: false,
  // game
  castleBuilt: false, castleLevel: 1, prestige: 0,
  houses: 0, fields: 0, camps: 0, mines: 0,
  // derived
  incomePerTick: 0,
  // positions
  occupied: [], housePositions: [], fieldPositions: [], campPositions: [], minePositions: [],
  treePositions: [], rockPositions: [],
  firstHouse: false,
};

export function setState(patch){
  Object.assign(state, patch);
  emit('state:changed', state);
}