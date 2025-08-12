const listeners = new Map();
export function on(evt, cb){ if(!listeners.has(evt)) listeners.set(evt, new Set()); listeners.get(evt).add(cb); }
export function emit(evt, payload){ (listeners.get(evt)||[]).forEach(cb=>cb(payload)); }

export const state = {
  gold: 0, wood: 0, stone: 0, wheat: 0, pop: 0,
  woodCap: 10, stoneCap: 10,
  zoneRadius: 2, mode: 'debug', muted: false,
  prestige: 0,
  // game
  castleBuilt: false, castleLevel: 1,
  houses: 0, fields: 0, camps: 0, mines: 0,
  // automation
  foremanBuilt: false, foremanLevel: 0, foremanOn: true, foremanTickAcc: 0,
  // derived
  incomePerTick: 0,
  stamina: { castle: 100, field: 100, camp: 100, mine: 100 },
  levels: { field: 1, camp: 1, mine: 1 },
  // positions
  occupied: [], housePositions: [], fieldPositions: [], campPositions: [], minePositions: [],
  treePositions: [], rockPositions: [],
  firstHouse: false,
};

export function setState(patch){
  Object.assign(state, patch);
  emit('state:changed', state);
}
