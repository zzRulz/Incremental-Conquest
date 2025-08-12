export const CONFIG = {
  VERSION: { major: 2, minor: 0, suffix: 'a' },
  GRID: { cols: 15, rows: 11, startRadius: 2 },
  CLICK: {
    base: { castle: 0.1, field: 0.1, camp: 0.1, mine: 0.1, mill: 0 },
    levelBonusPct: 10,
    staminaMax: 100,
    staminaCost: 10,
    staminaRegenPerSec: 5,
    critChance: 0.05,
    critMult: 2.0,
    holdMs: 500,
    holdMult: 3.0
  },
  COSTS: {
    CASTLE: { timeMs: 6000 },
    HOUSE:  { gold: 5, timeMs: 5000, popGain: 1 },
    FIELD:  { gold: 5, timeMs: 4000, pop: 1 },
    CAMP:   { gold: 8, timeMs: 6000, pop: 1 },
    MINE:   { gold: 8, wood: 5, timeMs: 8000, pop: 1 },
    MILL:   { gold: 20, wood: 10, timeMs: 6000 },
    WARE:   { gold: 10, wood: 15, timeMs: 4000, addWood: 50, addStone: 50 },
    MARKET: { gold: 20, timeMs: 4000 },
  },
  MARKET: { wheat: 0.8, wood: 0.6, stone: 0.7, drift: 0.03 },
  STORAGE: { woodCap: 10, stoneCap: 10 },
  SAVE_KEY: 'CONQ_CLICKER_V20A',
};
export function bumpPatch(ver){
  const seq = ['a','b','c','d','e','f','g'];
  const i = seq.indexOf(ver.suffix);
  if(i>=0 && i<seq.length-1){ ver.suffix = seq[i+1]; }
  else { ver.minor += 1; ver.suffix = 'a'; }
}
