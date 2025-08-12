const listeners = new Map();
export function on(evt, cb){ if(!listeners.has(evt)) listeners.set(evt, new Set()); listeners.get(evt).add(cb); }
export function emit(evt, payload){ (listeners.get(evt)||[]).forEach(cb=>cb(payload)); }


// 2.3g hotfix: migrate missing fields to safe defaults
export function migrateState(s){
  s = s || {};
  s.version = s.version || { major:2, minor:3, suffix:'g' };
  s.gold ||= 0; s.wood ||= 0; s.stone ||= 0; s.wheat ||= 0; s.science ||= 0; s.pop ||= 0;
  s.woodCap ||= 10; s.stoneCap ||= 10;
  s.zoneRadius ||= 2; s.zoneLevel ||= 1; s.zoneBonus ||= {}; s.zoneName ||= 'Campement';
  if (s.prestige == null) s.prestige = 0;
  if (s.prestigePoints == null) s.prestigePoints = 0;
  s.castleBuilt = !!s.castleBuilt;
  s.castleLevel = Math.max(1, Number(s.castleLevel||1));
  return s;
}

export const state = {
  version: { major: 2, minor: 3, suffix: 'g' },
  gold: 0, wood: 0, stone: 0, wheat: 0, science: 0, pop: 0,
  woodCap: 10, stoneCap: 10,
  zoneRadius: 2, zoneLevel: 1, zoneBonus: {}, zoneName: 'Campement',
  muted: false,
  prestige: 0, prestigePoints: 0,
  // game
  castleBuilt: false, castleLevel: 1,
  houses: 0, fields: 0, camps: 0, mines: 0, mills: 0, warehouses: 0, markets: 0, libraries: 0,
  // automations
  foreman: { built:false, level:0, on:false, clicksPerSec:1, wheatPerMin:5 },
  // derived
  stamina: { castle: 100, field: 100, camp: 100, mine: 100 },
  levels: { field: 1, camp: 1, mine: 1 },
  globalMult: 1.0,
  event: { id:null, label:'Aucun événement', timeLeft:0, mult:{}, marketBonus:0 },
  tech: {}, techBonus:{}, artBonus:{}, artifacts: [],
  // positions
  occupied: [], housePositions: [], fieldPositions: [], campPositions: [], minePositions: [],
  millPositions: [], warePositions: [], marketPositions: [], libraryPositions: [],
  treePositions: [], rockPositions: [],
  // tracking
  clicks: { castle:0, field:0, camp:0, mine:0, library:0 },
  totals: { gold:0, wheat:0, wood:0, stone:0, science:0 },
  achievements: {}, quests: {},
  market: { wheat: 0.8, wood: 0.6, stone: 0.7 },
  // boss
  boss: { active:false, hp:0, max:0, index:null, name:'' },
};

export function setState(patch){
  Object.assign(state, patch);
  emit('state:changed', state);
}
