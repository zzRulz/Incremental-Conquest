const listeners = new Map();
export function on(evt, cb){ if(!listeners.has(evt)) listeners.set(evt, new Set()); listeners.get(evt).add(cb); }
export function emit(evt, payload){ (listeners.get(evt)||[]).forEach(cb=>cb(payload)); }

export const state = {
  gold: 0, wood: 0, stone: 0, wheat: 0, pop: 0,
  woodCap: 10, stoneCap: 10, warehouses: 0,
  zoneRadius: 2, mode: 'debug', muted: false,
  // game
  castleBuilt: false, castleLevel: 1, prestige: 0,
  houses: 0, fields: 0, camps: 0, mines: 0,
  // derived
  stamina: { castle: 100, field: 100, camp: 100, mine: 100 },
  levels: { field: 1, camp: 1, mine: 1 },  // upgrade hooks
  incomePerTick: 0,
  // positions
  foremanBuilt: false, foremanLevel: 0, foremanOn: true, foremanTickAcc: 0,
  occupied: [], housePositions: [], fieldPositions: [], campPositions: [], minePositions: [],
  treePositions: [], rockPositions: [],
  firstHouse: false,
};

export function setState(patch){
  Object.assign(state, patch);
  emit('state:changed', state);
}