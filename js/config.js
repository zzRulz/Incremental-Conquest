export const CONFIG = {
  VERSION: { major: 2, minor: 2, suffix: 'a' },
  GRID: { cols: 15, rows: 11, startRadius: 2 },
  CLICK: {
    base: { castle: 0.1, field: 0.1, camp: 0.1, mine: 0.1, mill: 0, library: 0.1 },
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
    LIB:    { gold: 50, wood: 20, timeMs: 6000 },
    FOREMAN:{ gold: 10, wood: 10, pop: 3, timeMs: 2000, wheatPerMin: 5 }
  },
  MARKET: { wheat: 0.8, wood: 0.6, stone: 0.7, drift: 0.03 },
  STORAGE: { woodCap: 10, stoneCap: 10 },
  EVENTS: [
    { id:'harvest',    label:'Fête des moissons — blé x2',     dur: 30, mult:{ field:2 } },
    { id:'goldrush',   label:'Ruée vers l’or — or x2',          dur: 25, mult:{ castle:2 } },
    { id:'lumberfest', label:'Foire du bois — bois x2',         dur: 30, mult:{ camp:2 } },
    { id:'stoneage',   label:'Âge de pierre — pierre x2',       dur: 30, mult:{ mine:2 } },
    { id:'marketboom', label:'Boom du marché — prix +20%',      dur: 40, market:+0.2 }
  ],
  ZONES: [
    { id:1, name:'Campement', cost:null, bonus:{} },
    { id:2, name:'Forêt profonde', cost:{ gold:200, wheat:50 }, bonus:{ camp:1.2 } },
    { id:3, name:'Carrière grise', cost:{ gold:500, wood:100 }, bonus:{ mine:1.3 } },
    { id:4, name:'Prairie dorée', cost:{ gold:800, wheat:200 }, bonus:{ field:1.3 } },
    { id:5, name:'Marché noir',   cost:{ gold:1200, stone:100 }, bonus:{ castle:1.25 } }
  ],
  TECH: [
    { id:'agro',   name:'Agronomie',   cost:50,  bonus:{ field:1.2 } },
    { id:'forest', name:'Sylviculture',cost:60,  bonus:{ camp:1.2 } },
    { id:'mining', name:'Géologie',    cost:60,  bonus:{ mine:1.2 } },
    { id:'econ',   name:'Économie',    cost:70,  bonus:{ castle:1.2 } },
    { id:'log',    name:'Logistique',  cost:40,  effect:'market+10' },
    { id:'store',  name:'Entrepôts',   cost:80,  effect:'+cap50' }
  ],
  ARTIFACTS: [
    { id:'ringGold',   name:'Anneau d’Aurum',    desc:'+10% or',         bonus:{ castle:1.10 } },
    { id:'totemWood',  name:'Totem de Chêne',    desc:'+10% bois',       bonus:{ camp:1.10 } },
    { id:'runeStone',  name:'Rune de Granite',   desc:'+10% pierre',     bonus:{ mine:1.10 } },
    { id:'scythe',     name:'Faucille Antique',  desc:'+10% blé',        bonus:{ field:1.10 } },
    { id:'owl',        name:'Chouette Sagesse',  desc:'+1 science/clic', effect:'+science1' }
  ],
  SAVE_KEY: 'CONQ_CLICKER_V22A',
};
export function bumpPatch(ver){
  const seq = ['a','b','c','d','e','f','g'];
  const i = seq.indexOf(ver.suffix);
  if(i>=0 && i<seq.length-1){ ver.suffix = seq[i+1]; }
  else { ver.minor += 1; ver.suffix = 'a'; }
}
