export const CONFIG = {
  GRID: { cols: 15, rows: 11, startRadius: 2 },
  CASTLE: { buildTimeMs: 6000, maxLevel: 10 },
  HOUSE:  { costGold: 5, buildTimeMs: 5000, popGain: 1 },
  FIELD:  { costGold: 5, buildTimeMs: 4000 },
  CAMP:   { costGold: 8, buildTimeMs: 6000 },
  MINE:   { costGold: 8, costWood: 5, buildTimeMs: 8000 },
  STORAGE: { woodCap: 10, stoneCap: 10 },
  CLICK: {
    base: { castle: 0.1, field: 0.1, camp: 0.1, mine: 0.1 },
    levelBonusPct: 10,
    staminaMax: 100,
    staminaCost: 10,
    staminaRegenPerSec: 5,
    critChance: 0.05,
    critMult: 2.0,
    holdMs: 500,
    holdMult: 3.0
  },
  SAVE_KEY: 'CONQ_CLICKER_V11',
};
