export const CONFIG = {
  GRID: { cols: 15, rows: 11, startRadius: 2 },
  TICKS: { goldDebug: 2000, goldNormal: 60000, resDebug: 2000, resNormal: 30000 },
  CASTLE: { buildTimeMs: 10000, baseIncomePerTick: 1, maxLevel: 10, upgradeBaseCost: 10 },
  HOUSE:  { costGold: 5, buildTimeMs: 5000, popGain: 1, upkeepPerTick: 0 },
  FIELD:  { costGold: 5, buildTimeMs: 4000, goldPerTick: 0.5 },
  CAMP:   { costGold: 8, buildTimeMs: 6000, popCost: 1, woodPerTick: 1 },
  MINE:   { costGold: 8, costWood: 5, buildTimeMs: 8000, popCost: 1, stonePerTick: 1 },
  WARE:   { costWood: 10, costStone: 10, buildTimeMs: 8000, capPlus: 15 },
  STORAGE: { woodCap: 10, stoneCap: 10 },
  FOREMAN: { costGold: 10, costWood: 10, popCost: 3, speedPerLevel: 1 },
  SAVE_KEY: 'CC_CLICKER_V1',
  CLICK: {
    base: { castle: 0.1, field: 0.1, camp: 0.1, mine: 0.1 },
    levelBonusPct: 10,      // +10% per level
    staminaMax: 100,        // per type
    staminaCost: 10,        // per click
    staminaRegenPerSec: 5,  // free regen
    critChance: 0.05,       // 5%
    critMult: 2.0,
    holdMs: 500,            // hold to charge
    holdMult: 3.0
  },
};