export const CONFIG = {
  GRID: { cols: 15, rows: 11, startRadius: 2 },
  TICKS: { goldDebug: 2000, goldNormal: 60000, resDebug: 2000, resNormal: 30000 },
  CASTLE: { buildTimeMs: 10000, baseIncomePerTick: 1, maxLevel: 10, upgradeBaseCost: 10 },
  HOUSE:  { costGold: 5, buildTimeMs: 5000, popGain: 2, upkeepPerTick: 0.5 },
  FIELD:  { costGold: 3, buildTimeMs: 4000, goldPerTick: 0.5 },
  CAMP:   { costGold: 8, buildTimeMs: 6000, popCost: 2, woodPerTick: 1 },
  MINE:   { costGold: 10, costWood: 5, buildTimeMs: 8000, popCost: 2, stonePerTick: 1 },
  WARE:   { costWood: 10, costStone: 10, buildTimeMs: 8000, capPlus: 15 },
  STORAGE: { woodCap: 10, stoneCap: 10 },
  SAVE_KEY: 'CC_PHASE3_V1',
};