
// Conquête Clicker v2.3a — STABLE BUNDLE (no modules)
(function(){
'use strict';

/* ===================== CONFIG ===================== */
const CONFIG = {
// === Prestige Skill Tree (tiered) ===
CONFIG.SKILL_TREE:  [
  { tier:1, reqTaken:0, nodes:[
    { id:'foreman',  name:'Contremaître',   cost:1, effect:'foremanUnlock', desc:'Débloque le contremaître' },
    { id:'stamina1', name:'Stamina I',      cost:1, effect:'staminaRegen+2', desc:'+2 regen stamina/s' },
    { id:'crit1',    name:'Crit I',         cost:1, effect:'crit+0.03', desc:'+3% critique' },
    { id:'castle1',  name:'Château I',      cost:1, effect:'castle+0.10', desc:'+10% or/clic' },
    { id:'farm1',    name:'Champs I',       cost:1, effect:'field+0.10', desc:'+10% blé/clic' },
    { id:'camp1',    name:'Camps I',        cost:1, effect:'camp+0.10', desc:'+10% bois/clic' },
    { id:'mine1',    name:'Mines I',        cost:1, effect:'mine+0.10', desc:'+10% pierre/clic' },
  ]},
  { tier:2, reqTaken:3, nodes:[
    { id:'global1',  name:'Global I',       cost:2, effect:'global+0.10', desc:'+10% tous clics' },
    { id:'crit2',    name:'Crit II',        cost:2, effect:'crit+0.03', desc:'+3% critique' },
    { id:'stamina2', name:'Stamina II',     cost:2, effect:'staminaRegen+3;staminaMax+20', desc:'+3 regen/s & +20 max' },
    { id:'foreman2', name:'Auto I',         cost:2, effect:'foreSpeed+0.25', desc:'+25% vitesse auto' },
    { id:'market1',  name:'Marché I',       cost:2, effect:'market+0.10', desc:'+10% prix de vente' },
    { id:'cap1',     name:'Capacité I',     cost:2, effect:'cap+100', desc:'+100 cap bois/pierre' },
    { id:'science1', name:'Science I',      cost:2, effect:'libMult+0.25', desc:'+25% science/clic' },
  ]},
  { tier:3, reqTaken:2, nodes:[
    { id:'global2',  name:'Global II',      cost:3, effect:'global+0.15', desc:'+15% tous clics' },
    { id:'hold2',    name:'Chargé II',      cost:3, effect:'hold->4.0', desc:'Clic chargé x4' },
    { id:'double1',  name:'Double-clic',    cost:3, effect:'double+0.10', desc:'10% de répéter le gain' },
    { id:'events1',  name:'Événements+',    cost:3, effect:'event+10', desc:'+10s durées d’événements' },
    { id:'boss1',    name:'Butin+',         cost:3, effect:'artifact+0.10', desc:'+10% chance artéfact' },
  ]},
  { tier:4, reqTaken:2, nodes:[
    { id:'pp1',      name:'PP Boost',       cost:4, effect:'pp+0.50', desc:'+50% points de prestige' },
    { id:'foreman3', name:'Auto II',        cost:4, effect:'foreSpeed+0.35', desc:'+35% vitesse auto' },
    { id:'stamina3', name:'Stamina III',    cost:4, effect:'staminaMax+30', desc:'+30 stamina max' },
  ]},
],

  VERSION: { major:2, minor:3, suffix:'g' },
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
  SAVE_KEY: 'CONQ_CLICKER_V23A',
};
function bumpPatch(ver){
  const seq = ['a','b','c','d','e','f','g'];
  const i = seq.indexOf(ver.suffix);
  if(i>=0 && i<seq.length-1){ ver.suffix = seq[i+1]; }
  else { ver.minor += 1; ver.suffix = 'a'; }
}

/* ===================== STATE ===================== */
const state = {
  version: { ...CONFIG.VERSION },
  gold: 0, wood: 0, stone: 0, wheat: 0, science: 0, pop: 0,
  woodCap: CONFIG.STORAGE.woodCap, stoneCap: CONFIG.STORAGE.stoneCap,
  zoneRadius: CONFIG.GRID.startRadius, zoneLevel: 1, zoneBonus: {}, zoneName: 'Campement',
  prestige: 0, prestigePoints: 0,
  castleBuilt: false, castleLevel: 1,
  houses: 0, fields: 0, camps: 0, mines: 0, mills: 0, warehouses: 0, markets: 0, libraries: 0,
  foreman: { built:false, level:0, on:false, clicksPerSec:1, wheatPerMin:5 },
  stamina: { castle: 100, field: 100, camp: 100, mine: 100 },
  levels: { field: 1, camp: 1, mine: 1 },
  globalMult: 1.0,
  event: { id:null, label:'Aucun événement', timeLeft:0, mult:{}, marketBonus:0 },
  tech: {}, techBonus:{}, artBonus:{}, artifacts: [],
  prestigeTaken: {}, prestigeEffects: { critAdd:0, holdMult:null, staminaRegenAdd:0, staminaMaxAdd:0, foremanSpeed:1, marketAdd:0, libraryMult:1, doubleChance:0, eventExtra:0, ppMult:1, mult:{ castle:1, field:1, camp:1, mine:1, global:1 } },
  occupied: [], housePositions: [], fieldPositions: [], campPositions: [], minePositions: [],
  millPositions: [], warePositions: [], marketPositions: [], libraryPositions: [],
  treePositions: [], rockPositions: [],
  clicks: { castle:0, field:0, camp:0, mine:0, library:0 },
  totals: { gold:0, wheat:0, wood:0, stone:0, science:0 },
  achievements: {}, quests: {},
  market: { wheat: 0.8, wood: 0.6, stone: 0.7 },
  boss: { active:false, hp:0, max:0, index:null, name:'' },
};

function setState(patch){
  Object.assign(state, patch);
  refreshHeader();
}

/* ===================== SAVE/LOAD ===================== */
function save(){ try{ localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(state)); }catch(e){} }
function load(){ try{ const raw=localStorage.getItem(CONFIG.SAVE_KEY); if(raw){ Object.assign(state, JSON.parse(raw)); } }catch(e){} }
window.addEventListener('beforeunload', save);

/* ===================== GRID ===================== */
const board = document.getElementById('board');
const zoneNameEl = document.getElementById('zoneName');
const zoneLvlEl = document.getElementById('zoneLvl');
const prestigeHdr = document.getElementById('prestigeHeader');
const ppHdr = document.getElementById('ppHeader');
const cols = CONFIG.GRID.cols, rows = CONFIG.GRID.rows;
const centerR = Math.floor(rows/2), centerC = Math.floor(cols/2);
function idx(r,c){ return r*cols+c; }
function pos(i){ return [Math.floor(i/cols), i%cols]; }
function getCenterIndex(){ return idx(centerR,centerC); }
function occupy(i){ if(!state.occupied.includes(i)) state.occupied.push(i); }
function isInZone(r,c){ return Math.max(Math.abs(r-centerR), Math.abs(c-centerC)) <= state.zoneRadius; }

function initGrid(){
  board.style.gridTemplateColumns = `repeat(${cols}, var(--tile))`;
  board.style.gridTemplateRows = `repeat(${rows}, var(--tile))`;
  board.innerHTML = '';
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const cell = document.createElement('div');
      cell.className='cell';
      cell.dataset.r=r; cell.dataset.c=c;
      if(r===centerR && c===centerC){ cell.classList.add('center'); cell.id='centerCell'; }
      board.appendChild(cell);
    }
  }
  if(zoneNameEl) zoneNameEl.textContent = state.zoneName;
  if(zoneLvlEl) zoneLvlEl.textContent = state.zoneLevel;
}
function getRandomFreeCell(inZone=true){
  const free=[];
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      if(inZone && !isInZone(r,c)) continue;
      const i=idx(r,c);
      if(i===getCenterIndex()) continue;
      if(!state.occupied.includes(i)) free.push(i);
    }
  }
  return free.length? free[Math.floor(Math.random()*free.length)] : null;
}
function getFreeAdjacentTo(list){
  const candidates=new Set();
  for(const ti of list){
    const [r,c]=pos(ti);
    [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([rr,cc])=>{
      if(rr<0||cc<0||rr>=rows||cc>=cols) return;
      const ii = idx(rr,cc);
      if(ii===getCenterIndex()) return;
      if(state.occupied.includes(ii)) return;
      if(!isInZone(rr,cc)) return;
      candidates.add(ii);
    });
  }
  const arr=[...candidates];
  return arr.length? arr[Math.floor(Math.random()*arr.length)] : null;
}
function placeEmoji(i,emoji,kind, handler){
  const el = board.children[i];
  el.textContent=emoji;
  el.dataset.kind=kind;
  el.dataset.index=i;
  if(handler){ el.addEventListener('click', handler); }
  occupy(i);
}
function repaintFromState(){
  const nodes=board.children;
  for(let i=0;i<nodes.length;i++){
    nodes[i].className='cell';
    nodes[i].textContent='';
    nodes[i].removeAttribute('data-kind');
    nodes[i].removeAttribute('data-index');
  }
  const ci=getCenterIndex(); const cc=board.children[ci]; cc.classList.add('center'); cc.id='centerCell';
  state.treePositions.forEach(i=> placeEmoji(i,'🌳','tree') );
  state.rockPositions.forEach(i=> placeEmoji(i,'🪨','rock') );
  if(state.boss.active && state.boss.index!=null){ placeEmoji(state.boss.index,'👹','boss', handleBossClick); }
  if(state.castleBuilt){ placeEmoji(ci,'🏰','castle', onClickUp); board.children[ci].addEventListener('mousedown', onClickDown); }
  state.housePositions.forEach(i=>{ placeEmoji(i,'🏠','house'); });
  state.fieldPositions.forEach(i=>{ placeEmoji(i,'🌾','field', onClickUp); board.children[i].addEventListener('mousedown', onClickDown); });
  state.campPositions.forEach(i=>{ placeEmoji(i,'🪓','camp', onClickUp); board.children[i].addEventListener('mousedown', onClickDown); });
  state.minePositions.forEach(i=>{ placeEmoji(i,'⛏️','mine', onClickUp); board.children[i].addEventListener('mousedown', onClickDown); });
  state.millPositions.forEach(i=>{ placeEmoji(i,'🌬️','mill', onClickUp); });
  state.warePositions.forEach(i=>{ placeEmoji(i,'📦','warehouse'); });
  state.marketPositions.forEach(i=>{ placeEmoji(i,'🏪','market'); });
  state.libraryPositions.forEach(i=>{ placeEmoji(i,'📚','library', onClickUp); });
  setDepletedClass(); reevaluateUnlocks(); updatePrestigeReady(); updateBuildButtons();
}
function setDepletedClass(){
  const nodes=board.children;
  for(let i=0;i<nodes.length;i++){
    const kind=nodes[i].dataset.kind;
    if(!kind) continue;
    const key=(kind==='field'||kind==='camp'||kind==='mine'||kind==='castle')?kind:null;
    if(!key) continue;
    const enough=(state.stamina[key]||0)>=CONFIG.CLICK.staminaCost;
    nodes[i].classList.toggle('depleted', !enough);
  }
}

/* ===================== RESOURCES PLACEMENT ===================== */
function placeNaturalResources(){
  const treesWanted = state.prestige >= 2 ? Math.min(4, 1 + Math.floor((state.prestige - 2)/2)) : 0;
  const ci=getCenterIndex(); const [cr,cc]=pos(ci);
  const ring=[idx(cr-1,cc), idx(cr+1,cc), idx(cr,cc-1), idx(cr,cc+1)].filter(i=>i>=0);
  state.treePositions=[]; state.rockPositions=[];
  let avail=ring.filter(i=>!state.occupied.includes(i));
  for(let n=0;n<treesWanted && n<avail.length;n++){ const i=avail[n]; placeEmoji(i,'🌳','tree'); state.treePositions.push(i); occupy(i); }
  const rocksWanted = Math.min(8, Math.floor(state.prestige / 3));
  const ring2=[idx(cr-2,cc), idx(cr+2,cc), idx(cr,cc-2), idx(cr,cc+2)].filter(i=>i>=0);
  let av2 = ring2.filter(i=>!state.occupied.includes(i));
  for(let n=0;n<rocksWanted && n<av2.length;n++){ const i=av2[n]; placeEmoji(i,'🪨','rock'); state.rockPositions.push(i); occupy(i); }
}

/* ===================== PANEL (LEFT) ===================== */
const left = document.getElementById('leftPanel');
function getMult(kind){
  const ev = state.event.mult[kind] || 1;
  const zone = state.zoneBonus[kind] || 1;
  const tech = state.techBonus[kind] || 1;
  const art  = state.artBonus[kind] || 1;
  const pre  = (state.prestigeEffects?.mult?.[kind]||1) * (state.prestigeEffects?.mult?.global||1);
  return state.globalMult * ev * zone * tech * art * pre;
}
function staminaWidth(key){ return Math.max(0, Math.min(100, state.stamina[key]||0)); }
function yieldPerClick(kind){
  const base = { castle:.1, field:.1, camp:.1, mine:.1 }[kind]||0;
  const lvl = (kind==='castle')?state.castleLevel:state.levels[kind]||1;
  const bonus = 1 + 0.10 * (lvl-1);
  return (base * bonus * getMult(kind)).toFixed(2);
}
function costForUpgrade(kind){
  const lvl = (kind==='castle')?state.castleLevel:state.levels[kind];
  return Math.ceil(5 * Math.pow(1.35, (lvl-1)));
}
function upsert(kind, icon, title, usesStamina){
  let selector = `[data-kind="${kind}"]`;
  let card = left.querySelector(selector);
  if(kind!=='house'){
    const hasAny = (kind==='castle')? state.castleBuilt : (state[kind+'s']>0);
    if(!hasAny){ if(card) card.remove(); return; }
  } else { if(state.houses<=0){ if(card) card.remove(); return; } }
  if(!card){
    card=document.createElement('div'); card.className='building-card'; card.dataset.kind=kind;
    card.innerHTML = `<div class="building-name">${icon} ${title} <span class="count"></span></div>
    <div class="prod-label small"></div>
    <div class="prod-bar"><div class="prod-fill"></div></div>
    ${kind!=='house'?'<div class="row"><button class="btn upg">Améliorer</button><span class="small muted tips"></span></div>':''}`;
    left.appendChild(card);
    if(kind!=='house'){
      card.querySelector('.upg').addEventListener('click', ()=>{
        const lvl = (kind==='castle')? state.castleLevel : state.levels[kind];
        const cost = costForUpgrade(kind);
        if(state.gold < cost){ card.querySelector('.tips').textContent = `Coût: ${cost} or`; return; }
        setState({ gold: state.gold - cost });
        if(kind==='castle'){ setState({ castleLevel: state.castleLevel+1 }); }
        else { state.levels[kind] = (lvl||1)+1; setState({ levels: state.levels }); }
        card.querySelector('.tips').textContent = `Niv ${(lvl||1)+1}`;
        refreshAll();
      });
    }
  }
  const count = (kind==='castle')?'':`× ${(kind==='house')?state.houses:state[kind+'s']}`;
  card.querySelector('.count').textContent = count;
  if(kind==='house'){ card.querySelector('.prod-label').textContent = `+1 pop / maison`; }
  else if(kind==='castle'){ card.querySelector('.prod-label').textContent = `Niv ${state.castleLevel} • +${yieldPerClick('castle')} or / clic`; }
  else if(kind==='field'){ card.querySelector('.prod-label').textContent = `Niv ${state.levels.field} • +${yieldPerClick('field')} blé / clic`; }
  else if(kind==='camp'){ card.querySelector('.prod-label').textContent = `Niv ${state.levels.camp} • +${yieldPerClick('camp')} bois / clic`; }
  else if(kind==='mine'){ card.querySelector('.prod-label').textContent = `Niv ${state.levels.mine} • +${yieldPerClick('mine')} pierre / clic`; }
  const bar = card.querySelector('.prod-fill');
  bar.style.width = usesStamina ? staminaWidth(kind) + '%' : '100%';
}
function refreshAll(){
function canBuild(kind){
  const C = CONFIG.COSTS;
  switch(kind){
    case 'house': return { ok: state.gold>=C.HOUSE.gold, why: state.gold>=C.HOUSE.gold? '' : `Besoin ${C.HOUSE.gold} or` };
    case 'field': return { ok: state.gold>=C.FIELD.gold && state.pop>=C.FIELD.pop, why: state.gold<C.FIELD.gold?`Besoin ${C.FIELD.gold} or`: (state.pop<C.FIELD.pop?`Besoin ${C.FIELD.pop} pop`: '') };
    case 'camp': {
      const okCost = state.gold>=C.CAMP.gold && state.pop>=C.CAMP.pop;
      const slot = getFreeAdjacentTo(state.treePositions);
      if(!okCost) return { ok:false, why: state.gold<C.CAMP.gold?`Besoin ${C.CAMP.gold} or`:`Besoin ${C.CAMP.pop} pop` };
      if(slot===null) return { ok:false, why:'Aucun emplacement près d’un 🌳' };
      return { ok:true, why:'' };
    }
    case 'mine': {
      const okCost = state.gold>=C.MINE.gold && state.wood>=C.MINE.wood && state.pop>=C.MINE.pop;
      const slot = getFreeAdjacentTo(state.rockPositions);
      if(!okCost){
        if(state.gold<C.MINE.gold) return { ok:false, why:`Besoin ${C.MINE.gold} or` };
        if(state.wood<C.MINE.wood) return { ok:false, why:`Besoin ${C.MINE.wood} bois` };
        if(state.pop<C.MINE.pop) return { ok:false, why:`Besoin ${C.MINE.pop} pop` };
      }
      if(slot===null) return { ok:false, why:'Aucun emplacement près d’une 🪨' };
      return { ok:true, why:'' };
    }
    case 'mill': return { ok: state.gold>=C.MILL.gold && state.wood>=C.MILL.wood, why: state.gold<C.MILL.gold?`Besoin ${C.MILL.gold} or`:`Besoin ${C.MILL.wood} bois` };
    case 'warehouse': return { ok: state.gold>=C.WARE.gold && state.wood>=C.WARE.wood, why: state.gold<C.WARE.gold?`Besoin ${C.WARE.gold} or`:`Besoin ${C.WARE.wood} bois` };
    case 'market': return { ok: state.gold>=C.MARKET.gold, why: state.gold>=C.MARKET.gold? '' : `Besoin ${C.MARKET.gold} or` };
    case 'library': return { ok: state.gold>=C.LIB.gold && state.wood>=C.LIB.wood, why: state.gold<C.LIB.gold?`Besoin ${C.LIB.gold} or`:`Besoin ${C.LIB.wood} bois` };
    case 'foreman': return { ok: state.gold>=C.FOREMAN.gold && state.wood>=C.FOREMAN.wood && state.pop>=C.FOREMAN.pop, 
      why: state.gold<C.FOREMAN.gold?`Besoin ${C.FOREMAN.gold} or`: (state.wood<C.FOREMAN.wood?`Besoin ${C.FOREMAN.wood} bois`:`Besoin ${C.FOREMAN.pop} pop`) };
    default: return { ok:true, why:'' };
  }
}
function updateBuildButtons(){
  // Hide castle build once built
  const castleBuild = document.getElementById('buildCastleBtn');
  if(castleBuild){ castleBuild.style.display = state.castleBuilt ? 'none' : ''; }

  const map=[
    ['house','buildHouseBtn','houseMsg'],
    ['field','buildFieldBtn','fieldMsg'],
    ['camp','buildCampBtn','campMsg'],
    ['mine','buildMineBtn','mineMsg'],
    ['mill','buildMillBtn','millMsg'],
    ['warehouse','buildWarehouseBtn','warehouseMsg'],
    ['market','buildMarketBtn','marketMsg'],
    ['library','buildLibraryBtn','libraryMsg'],
    ['foreman','buildForemanBtn','foremanMsg'],
  ];
  map.forEach(([k,btnId,msgId])=>{
    const btn=document.getElementById(btnId); const msg=document.getElementById(msgId);
    const card=document.getElementById(k+'Card');
    if(!btn||!card||card.style.display==='none') return;
    const gate = (typeof isUnlocked==='function') ? isUnlocked(k) : true;
    if(!gate){ btn.disabled=true; if(msg) msg.textContent='Condition de déblocage non remplie'; return; }
    const {ok, why}=canBuild(k);
    btn.disabled = !ok;
    if(msg){ msg.textContent = ok? '—' : why; }
    btn.title = ok? '' : why;
  });

  updatePrestigeHint();
}
function updatePrestigeHint(){
  const msg = document.getElementById('castleMsg');
  const goP = document.getElementById('goPrestigeBtn');
  if(!msg || !state.castleBuilt) return;
  const ready = state.castleLevel>=10;
  if(!ready){
    msg.textContent = '⭐ Prestige: Château niv. 10 requis';
  } else {
    msg.textContent = '—';
  }
}

function updatePrestigeReady(){
  const btn = document.getElementById('goPrestigeBtn');
  if(!btn) return;
  const ready = state.castleBuilt && state.castleLevel >= 10;
  btn.style.display = ready ? '' : 'none';
}

function isUnlocked(kind){
  switch(kind){
    case 'house': return state.castleBuilt;
    case 'field': return state.castleBuilt && state.pop >= 1; // nécessite au moins 1 maison
    case 'camp':  return state.prestige >= 2 && state.fields >= 1 && state.treePositions.length>0; // arbres + champ
    case 'mine':  return state.camps >= 1 && (state.tech['mining'] || state.zoneLevel >= 3 || state.totals.wood >= 100);
    case 'mill':  return state.fields >= 2 && state.castleLevel >= 2;
    case 'warehouse': return (state.wood >= state.woodCap*0.6) || (state.totals.wood >= 50);
    case 'market': return (state.totals.gold >= 100) || (state.castleLevel >= 2);
    case 'library': return (state.totals.gold >= 200) || (state.markets >= 1);
    case 'foreman': return !!state.achievements['foremanUnlock'] || state.foreman.built;
    default: return false;
  }
}
function reevaluateUnlocks(){
  // Toggle build cards visibility
  const map = {
    house:'houseCard', field:'fieldCard', camp:'campCard', mine:'mineCard', mill:'millCard',
    warehouse:'warehouseCard', market:'marketCard', library:'libraryCard', foreman:'foremanCard'
  };
  Object.entries(map).forEach(([k,id])=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.style.display = isUnlocked(k) ? '' : 'none';
  });
}

  upsert('castle','🏰','Château', true);
  upsert('house','🏠','Maisons', false);
  upsert('field','🌾','Champs', true);
  upsert('camp','🪓','Camps', true);
  upsert('mine','⛏️','Mines', true);
  setDepletedClass(); reevaluateUnlocks(); updatePrestigeReady(); updateBuildButtons();
}

/* ===================== CLICKER ===================== */
let holdMap=new Map();
function perClick(kind){
  const base = CONFIG.CLICK.base[kind]||0;
  const level = (kind==='castle')? state.castleLevel : (state.levels[kind]||1);
  const lvlBonus = 1 + (CONFIG.CLICK.levelBonusPct/100) * (level-1);
  return base * lvlBonus * getMult(kind);
}
function spendStamina(kind){
  const cost=CONFIG.CLICK.staminaCost;
  state.stamina[kind] = Math.max(0, (state.stamina[kind]||0)-cost);
  refreshAll();
}
function showFloat(i, text, cls=''){
  const el=board.children[i];
  const span=document.createElement('div'); span.className='float-num '+cls; span.textContent=text; el.appendChild(span);
  setTimeout(()=>span.remove(), 900);
}
function chargeRing(i,on){
  const el=board.children[i]; let ring=el.querySelector('.charge-ring');
  if(on){ if(!ring){ ring=document.createElement('div'); ring.className='charge-ring'; el.appendChild(ring);} }
  else { if(ring) ring.remove(); }
}
function onClickDown(e){
  const el=e.currentTarget; const i=parseInt(el.dataset.index||el.dataset.i||0,10);
  const kind=el.dataset.kind; if(!kind) return;
  if(kind!=='house' && kind!=='tree' && kind!=='rock') chargeRing(i,true);
  holdMap.set(i, performance.now());
}
function onClickUp(e){
  const el=e.currentTarget; const i=parseInt(el.dataset.index||el.dataset.i||0,10);
  const kind=el.dataset.kind; if(!kind) return;
  const t0=holdMap.get(i)||performance.now(); const held=performance.now()-t0; holdMap.delete(i); chargeRing(i,false);
  if(kind==='house'||kind==='tree'||kind==='rock'||kind==='boss') return;
  const staminaKey=(kind==='field'||kind==='camp'||kind==='mine'||kind==='castle')?kind:(kind==='mill'?'mill':null);
  if(staminaKey && (state.stamina[staminaKey]||0) < CONFIG.CLICK.staminaCost){ showFloat(i,'épuisé'); return; }
  let mult=1; const holdM = (state.prestigeEffects.holdMult||CONFIG.CLICK.holdMult);
  if(held>=CONFIG.CLICK.holdMs) mult*=holdM;
  const critChance = CONFIG.CLICK.critChance + (state.achievements['critPlus']?0.02:0) + (state.prestigeEffects.critAdd||0);
  const crit = Math.random()<critChance; if(crit) mult*=CONFIG.CLICK.critMult;

  if(kind==='castle'){ let v=perClick('castle')*mult; let add=v; if(Math.random()<(state.prestigeEffects.doubleChance||0)) add+=v; setState({ gold: state.gold+add, totals:{...state.totals, gold: state.totals.gold+add}, clicks:{...state.clicks, castle: state.clicks.castle+1} }); showFloat(i,`+${add.toFixed(2)} or`, crit?'crit':''); spendStamina('castle'); }
  else if(kind==='field'){ let v=perClick('field')*mult; let add=v; if(Math.random()<(state.prestigeEffects.doubleChance||0)) add+=v; setState({ wheat: state.wheat+add, totals:{...state.totals, wheat: state.totals.wheat+add}, clicks:{...state.clicks, field: state.clicks.field+1} }); showFloat(i,`+${add.toFixed(2)} blé`, crit?'crit':''); spendStamina('field'); }
  else if(kind==='camp'){ let v=perClick('camp')*mult; let add=v; if(Math.random()<(state.prestigeEffects.doubleChance||0)) add+=v; setState({ wood: Math.min(state.woodCap, state.wood+add), totals:{...state.totals, wood: state.totals.wood+add}, clicks:{...state.clicks, camp: state.clicks.camp+1} }); showFloat(i,`+${add.toFixed(2)} bois`, crit?'crit':''); spendStamina('camp'); }
  else if(kind==='mine'){ let v=perClick('mine')*mult; let add=v; if(Math.random()<(state.prestigeEffects.doubleChance||0)) add+=v; setState({ stone: Math.min(state.stoneCap, state.stone+add), totals:{...state.totals, stone: state.totals.stone+add}, clicks:{...state.clicks, mine: state.clicks.mine+1} }); showFloat(i,`+${add.toFixed(2)} pierre`, crit?'crit':''); spendStamina('mine'); }
  else if(kind==='mill'){ if(state.wheat<1){ showFloat(i,'blé manquant'); return; } const g=0.8*mult; setState({ wheat: state.wheat-1, gold: state.gold+g }); showFloat(i,`-1 blé → +${g.toFixed(2)} or`); }
  else if(kind==='library'){ let v=0.1*mult*(state.prestigeEffects.libraryMult||1); if(state.artBonus['sciencePlus']) v+=1; setState({ science: state.science+v, totals:{...state.totals, science: state.totals.science+v}, clicks:{...state.clicks, library: state.clicks.library+1} }); showFloat(i,`+${v.toFixed(2)} sci`); }
  refreshAll();
}

/* ===================== BUILDINGS (RIGHT) ===================== */
function setupBuildButtons(){
  byId('buildCastleBtn').addEventListener('click', buildCastle);
  var goP=document.getElementById('goPrestigeBtn'); if(goP){ goP.addEventListener('click', ()=> openModal('prestigeModal')); }
  byId('buildHouseBtn').addEventListener('click', buildHouse);
  byId('buildFieldBtn').addEventListener('click', buildField);
  byId('buildCampBtn').addEventListener('click', buildCamp);
  byId('buildMineBtn').addEventListener('click', buildMine);
  byId('buildMillBtn').addEventListener('click', buildMill);
  byId('buildWarehouseBtn').addEventListener('click', buildWarehouse);
  byId('buildMarketBtn').addEventListener('click', buildMarket);
  byId('buildLibraryBtn').addEventListener('click', buildLibrary);
  // market
  byId('sellWheat').addEventListener('click', sellWheat);
  byId('sellWood').addEventListener('click', sellWood);
  byId('sellStone').addEventListener('click', sellStone);
  // foreman
  byId('buildForemanBtn').addEventListener('click', buildForeman);
  byId('toggleForemanBtn').addEventListener('click', toggleForeman);
  byId('upgradeForemanBtn').addEventListener('click', upgradeForeman);
}
function unlockAfterCastle(){ reevaluateUnlocks(); updateForemanUI(); }
function buildCastle(){
  if(state.castleBuilt) return;
  progressFill('castleFill', 6000);
  const btn=byId('buildCastleBtn'); btn.disabled=true; text('castleMsg','Construction… (6s)');
  setTimeout(()=>{
    const ci=getCenterIndex();
    placeEmoji(ci,'🏰','castle', onClickUp); board.children[ci].addEventListener('mousedown', onClickDown);
    setState({ castleBuilt:true });
    // Bonus départ 2.3g
    state.gold = (state.gold||0) + 10;
    text('castleMsg','Château construit ! +10 or de fondation');

    unlockAfterCastle();
    refreshAll(); placeNaturalResources(); updatePrestigeReady();
  }, CONFIG.COSTS.CASTLE.timeMs);
}
function buildHouse(){
  const cost=CONFIG.COSTS.HOUSE; if(state.gold<cost.gold){ text('houseMsg',`Pas assez d’or (${cost.gold}).`); return; }
  progressFill('houseFill', 5000);
  disableBtn('buildHouseBtn', true);
  setTimeout(()=>{
    disableBtn('buildHouseBtn', false); resetFill('houseFill');
    const i=getRandomFreeCell(true); if(i===null){ text('houseMsg','Plus d’emplacements libres !'); return; }
    placeEmoji(i,'🏠','house'); state.housePositions.push(i);
    setState({ gold: state.gold-cost.gold, houses: state.houses+1, pop: state.pop+cost.popGain });
    refreshAll();
  }, cost.timeMs);
}
function buildField(){
  const cost=CONFIG.COSTS.FIELD;
  if(state.gold<cost.gold){ text('fieldMsg',`Pas assez d’or (${cost.gold}).`); return; }
  if(state.pop<cost.pop){ text('fieldMsg',`Population insuffisante (${cost.pop}).`); return; }
  progressFill('fieldFill', 4000);
  disableBtn('buildFieldBtn', true);
  setTimeout(()=>{
    disableBtn('buildFieldBtn', false); resetFill('fieldFill');
    const i=getRandomFreeCell(true); if(i===null){ text('fieldMsg','Plus d’emplacements libres !'); return; }
    placeEmoji(i,'🌾','field', onClickUp); board.children[i].addEventListener('mousedown', onClickDown);
    state.fieldPositions.push(i);
    setState({ gold: state.gold-cost.gold, pop: state.pop-cost.pop, fields: state.fields+1 });
    refreshAll();
  }, cost.timeMs);
}
function buildCamp(){
  const cost=CONFIG.COSTS.CAMP;
  if(state.gold<cost.gold){ text('campMsg',`Pas assez d’or (${cost.gold}).`); return; }
  if(state.pop<cost.pop){ text('campMsg',`Population insuffisante (${cost.pop}).`); return; }
  if(state.treePositions.length<=0){ text('campMsg','Aucun arbre dispo (Prestige 2+).'); return; }
  progressFill('campFill', 6000);
  disableBtn('buildCampBtn', true);
  setTimeout(()=>{
    disableBtn('buildCampBtn', false); resetFill('campFill');
    let i=getFreeAdjacentTo(state.treePositions);
    if(i===null){ text('campMsg','Pas de case libre adjacente à un arbre.'); return; }
    placeEmoji(i,'🪓','camp', onClickUp); board.children[i].addEventListener('mousedown', onClickDown);
    state.campPositions.push(i);
    setState({ gold: state.gold-cost.gold, pop: state.pop-cost.pop, camps: state.camps+1 });
    refreshAll();
  }, cost.timeMs);
}
function buildMine(){
  const cost=CONFIG.COSTS.MINE;
  if(state.gold<cost.gold || state.wood<cost.wood){ text('mineMsg',`Coût: ${cost.gold} or + ${cost.wood} bois.`); return; }
  if(state.pop<cost.pop){ text('mineMsg',`Population insuffisante (${cost.pop}).`); return; }
  if(state.rockPositions.length<=0){ text('mineMsg','Aucune roche dispo.'); return; }
  progressFill('mineFill', 8000);
  disableBtn('buildMineBtn', true);
  setTimeout(()=>{
    disableBtn('buildMineBtn', false); resetFill('mineFill');
    let i=getFreeAdjacentTo(state.rockPositions);
    if(i===null){ text('mineMsg','Pas de case libre adjacente à une roche.'); return; }
    placeEmoji(i,'⛏️','mine', onClickUp); board.children[i].addEventListener('mousedown', onClickDown);
    state.minePositions.push(i);
    setState({ gold: state.gold-cost.gold, wood: state.wood-cost.wood, pop: state.pop-cost.pop, mines: state.mines+1 });
    refreshAll();
  }, cost.timeMs);
}
function buildMill(){
  const cost=CONFIG.COSTS.MILL;
  if(state.gold<cost.gold || state.wood<cost.wood){ text('millMsg',`Coût: ${cost.gold} or + ${cost.wood} bois.`); return; }
  progressFill('millFill', 6000);
  disableBtn('buildMillBtn', true);
  setTimeout(()=>{
    disableBtn('buildMillBtn', false); resetFill('millFill');
    let i=getRandomFreeCell(true); if(i===null){ text('millMsg','Plus d’emplacements libres !'); return; }
    placeEmoji(i,'🌬️','mill', onClickUp);
    state.millPositions.push(i);
    setState({ gold: state.gold-cost.gold, wood: state.wood-cost.wood, mills: state.mills+1 });
    refreshAll();
  }, cost.timeMs);
}
function buildWarehouse(){
  const cost=CONFIG.COSTS.WARE;
  if(state.gold<cost.gold || state.wood<cost.wood){ text('warehouseMsg',`Coût: ${cost.gold} or + ${cost.wood} bois.`); return; }
  progressFill('warehouseFill', 4000);
  disableBtn('buildWarehouseBtn', true);
  setTimeout(()=>{
    disableBtn('buildWarehouseBtn', false); resetFill('warehouseFill');
    let i=getRandomFreeCell(true); if(i===null){ text('warehouseMsg','Plus d’emplacements libres !'); return; }
    placeEmoji(i,'📦','warehouse');
    state.warePositions.push(i);
    setState({ gold: state.gold-cost.gold, wood: state.wood-cost.wood, woodCap: state.woodCap + cost.addWood, stoneCap: state.stoneCap + cost.addStone, warehouses: state.warehouses+1 });
    refreshAll();
  }, cost.timeMs);
}
function buildMarket(){
  const cost=CONFIG.COSTS.MARKET;
  if(state.gold<cost.gold){ text('marketMsg',`Pas assez d’or (${cost.gold}).`); return; }
  progressFill('marketFill', 4000);
  disableBtn('buildMarketBtn', true);
  setTimeout(()=>{
    disableBtn('buildMarketBtn', false); resetFill('marketFill');
    let i=getRandomFreeCell(true); if(i===null){ text('marketMsg','Plus d’emplacements libres !'); return; }
    placeEmoji(i,'🏪','market');
    state.marketPositions.push(i);
    setState({ gold: state.gold-cost.gold, markets: state.markets+1 });
    byId('marketUI').style.display='';
    refreshAll();
  }, cost.timeMs);
}
function buildLibrary(){
  const cost=CONFIG.COSTS.LIB;
  if(state.gold<cost.gold || state.wood<cost.wood){ text('libraryMsg',`Coût: ${cost.gold} or + ${cost.wood} bois.`); return; }
  progressFill('libraryFill', 6000);
  disableBtn('buildLibraryBtn', true);
  setTimeout(()=>{
    disableBtn('buildLibraryBtn', false); resetFill('libraryFill');
    let i=getRandomFreeCell(true); if(i===null){ text('libraryMsg','Plus d’emplacements libres !'); return; }
    placeEmoji(i,'📚','library', onClickUp);
    state.libraryPositions.push(i);
    setState({ gold: state.gold-cost.gold, wood: state.wood-cost.wood, libraries: state.libraries+1 });
    refreshAll();
  }, cost.timeMs);
}

/* Market */
function updateMarketPrices(){
  const bonus = 1 + (state.event.marketBonus||0) + (state.tech['log']?0.10:0) + (state.prestigeEffects.marketAdd||0);
  text('priceWheat', `${Math.round(state.market.wheat*10*bonus)} or`);
  text('priceWood', `${Math.round(state.market.wood*10*bonus)} or`);
  text('priceStone', `${Math.round(state.market.stone*10*bonus)} or`);
}
function sellWheat(){ const b=1+(state.event.marketBonus||0)+(state.tech['log']?0.10:0); if(state.wheat>=10){ setState({ wheat: state.wheat-10, gold: state.gold + state.market.wheat*10*b }); } }
function sellWood(){ const b=1+(state.event.marketBonus||0)+(state.tech['log']?0.10:0); if(state.wood>=10){ setState({ wood: state.wood-10, gold: state.gold + state.market.wood*10*b }); } }
function sellStone(){ const b=1+(state.event.marketBonus||0)+(state.tech['log']?0.10:0); if(state.stone>=10){ setState({ stone: state.stone-10, gold: state.gold + state.market.stone*10*b }); } }
function tickMarketDrift(){
  const d=CONFIG.MARKET.drift;
  state.market.wheat = clamp(state.market.wheat + (Math.random()*2-1)*d, 0.5, 1.2);
  state.market.wood  = clamp(state.market.wood  + (Math.random()*2-1)*d, 0.4, 1.0);
  state.market.stone = clamp(state.market.stone + (Math.random()*2-1)*d, 0.5, 1.1);
  updateMarketPrices();
}

/* ===================== FOREMAN (auto) ===================== */
function updateForemanUI(){
  const card=byId('foremanCard'); if(!card) return;
  card.style.display = isUnlocked('foreman') ? '' : 'none';
  if(state.foreman.built){
    show('toggleForemanBtn'); show('upgradeForemanBtn'); hide('buildForemanBtn');
    text('foremanMsg', `Niv ${state.foreman.level} • ${state.foreman.clicksPerSec.toFixed(1)} clic/s • Conso ${state.foreman.wheatPerMin}/min`);
    byId('toggleForemanBtn').textContent = state.foreman.on?'Pause':'Reprendre';
  } else {
    show('buildForemanBtn'); hide('toggleForemanBtn'); hide('upgradeForemanBtn');
    text('foremanMsg','—');
  }
}
function buildForeman(){
  if(state.foreman.built) return;
  const cost=CONFIG.COSTS.FOREMAN;
  if(state.gold<cost.gold || state.wood<cost.wood || state.pop<cost.pop){ text('foremanMsg', `Coût: ${cost.gold} or, ${cost.wood} bois, ${cost.pop} pop.`); return; }
  setState({ gold: state.gold-cost.gold, wood: state.wood-cost.wood, pop: state.pop-cost.pop, foreman: { built:true, level:1, on:true, clicksPerSec:1, wheatPerMin:5 } });
  updateForemanUI();
}
function toggleForeman(){ if(!state.foreman.built) return; state.foreman.on=!state.foreman.on; updateForemanUI(); }
function upgradeForeman(){
  if(!state.foreman.built) return;
  const next=state.foreman.level+1; const cost=Math.ceil(15*Math.pow(1.6, state.foreman.level-1));
  if(state.gold<cost){ text('foremanMsg',`Coût: ${cost} or`); return; }
  state.foreman.level=next; state.foreman.clicksPerSec=1+0.5*(next-1); state.foreman.wheatPerMin=5+2*(next-1);
  setState({ gold: state.gold-cost, foreman: state.foreman }); updateForemanUI();
}

/* ===================== EVENTS & BOSS ===================== */
const banner = document.getElementById('eventBanner');
function startEvents(){
  banner.textContent = state.event.label;
  setInterval(tickEvent, 1000);
  setInterval(()=>{
    if(state.event.timeLeft>0) return;
    if(Math.random()<0.4){
      const ev = CONFIG.EVENTS[Math.floor(Math.random()*CONFIG.EVENTS.length)];
      startEvent(ev);
      setTimeout(()=> maybeSpawnBoss(), 1200);
    }
  }, 15000);
}
function startEvent(ev){
  state.event.id = ev.id; state.event.label = ev.label; state.event.timeLeft=ev.dur + (state.prestigeEffects.eventExtra||0); state.event.mult=ev.mult||{}; state.event.marketBonus=ev.market||0;
  banner.textContent = `${ev.label} (${state.event.timeLeft}s)`;
}
function tickEvent(){
  if(state.event.timeLeft>0){
    state.event.timeLeft -= 1;
    if(state.event.timeLeft<=0){ state.event={ id:null, label:'Aucun événement', timeLeft:0, mult:{}, marketBonus:0 }; banner.textContent=state.event.label; }
    else { banner.textContent = `${state.event.label} (${state.event.timeLeft}s)`; }
  }
}
function maybeSpawnBoss(){
  if(state.boss.active) return;
  if(Math.random()<0.3){
    const i=getRandomFreeCell(true); if(i==null) return;
    const hp=20 + state.prestige*10 + state.zoneLevel*10;
    state.boss={ active:true, hp, max:hp, index:i, name:'Chef Brigand' };
    placeEmoji(i,'👹','boss', handleBossClick);
  }
}
function handleBossClick(e){
  if(!state.boss.active) return;
  const dmg=1 + state.castleLevel + Math.floor((state.levels.field+state.levels.camp+state.levels.mine)/3);
  state.boss.hp=Math.max(0, state.boss.hp-dmg);
  if(state.boss.hp===0){ // drop artifact
    const pool=['ringGold','totemWood','runeStone','scythe','owl']; const id=pool[Math.floor(Math.random()*pool.length)];
    grantArtifact(id);
    state.boss={ active:false, hp:0, max:0, index:null, name:'' };
    repaintFromState();
  }
}

/* ===================== ARTIFACTS ===================== */
function grantArtifact(id){
  if(state.artifacts.includes(id)) return false;
  state.artifacts.push(id);
  const def = CONFIG.ARTIFACTS.find(a=>a.id===id);
  if(def){
    if(def.bonus){ for(const [k,v] of Object.entries(def.bonus)){ state.artBonus[k]=(state.artBonus[k]||1)*v; } }
    if(def.effect==='+science1'){ state.artBonus['sciencePlus']=1; }
  }
  renderArtifacts();
  return true;
}
function renderArtifacts(){
  const list=byId('artList'); list.innerHTML='';
  if(state.artifacts.length===0){ const el=document.createElement('div'); el.className='small muted'; el.textContent='Aucun artéfact pour le moment.'; list.appendChild(el); return; }
  state.artifacts.forEach(id=>{
    const a=CONFIG.ARTIFACTS.find(x=>x.id===id);
    const el=document.createElement('div'); el.className='modal-section';
    el.innerHTML=`<div><b>${a?.name||id}</b> — <span class="small muted">${a?.desc||''}</span></div>`;
    list.appendChild(el);
  });
}

/* ===================== ZONES ===================== */
function initZones(){
  byId('zonesBtn').addEventListener('click', ()=>{ openModal('zonesModal'); renderZones(); });
  byId('zonesBackdrop').addEventListener('click', ()=> closeModal('zonesModal'));
  byId('zonesClose').addEventListener('click', ()=> closeModal('zonesModal'));
}
function renderZones(){
  const list=byId('zonesList'); list.innerHTML='';
  CONFIG.ZONES.forEach(z=>{
    const unlocked = state.zoneLevel >= z.id;
    const el=document.createElement('div'); el.className='modal-section';
    el.innerHTML = `<div><b>${z.name}</b> ${unlocked?'<span class="small muted">[débloquée]</span>':''}</div>`;
    const desc=document.createElement('div'); desc.className='small muted';
    const bonuses = Object.entries(z.bonus).map(([k,v])=>`${k}+${Math.round((v-1)*100)}%`).join(', ') || '—';
    desc.textContent = `Bonus: ${bonuses}`;
    el.appendChild(desc);
    if(!unlocked){
      const c=z.cost||{};
      const btn=document.createElement('button'); btn.className='btn'; btn.textContent=`Débloquer (or:${c.gold||0} bois:${c.wood||0} pierre:${c.stone||0} blé:${c.wheat||0})`;
      btn.addEventListener('click', ()=>{
        if((state.gold||0)<(c.gold||0)||(state.wood||0)<(c.wood||0)||(state.stone||0)<(c.stone||0)||(state.wheat||0)<(c.wheat||0)) return;
        setState({ gold: state.gold-(c.gold||0), wood: state.wood-(c.wood||0), stone: state.stone-(c.stone||0), wheat: state.wheat-(c.wheat||0), zoneLevel: z.id, zoneRadius: state.zoneRadius+1, zoneBonus: z.bonus, zoneName: z.name });
        placeNaturalResources(); repaintFromState(); refreshAll(); if(zoneNameEl) zoneNameEl.textContent = z.name; if(zoneLvlEl) zoneLvlEl.textContent = state.zoneLevel; renderZones();
      });
      el.appendChild(btn);
    } else { const tag=document.createElement('div'); tag.className='small muted'; tag.textContent='Active'; el.appendChild(tag); }
    list.appendChild(el);
  });
}

/* ===================== TECH ===================== */
function initTech(){
  byId('techBtn').addEventListener('click', ()=>{ openModal('techModal'); renderTech(); });
  byId('techBackdrop').addEventListener('click', ()=> closeModal('techModal'));
  byId('techClose').addEventListener('click', ()=> closeModal('techModal'));
}
function renderTech(){
  const list=byId('techList'); list.innerHTML='';
  CONFIG.TECH.forEach(t=>{
    const taken=!!state.tech[t.id];
    const el=document.createElement('div'); el.className='modal-section';
    el.innerHTML = `<div><b>${t.name}</b> ${taken?'<span class="small muted">[recherché]</span>':''}</div>`;
    const info=document.createElement('div'); info.className='small muted'; info.textContent = t.bonus?('Bonus: '+Object.entries(t.bonus).map(([k,v])=>`${k}+${Math.round((v-1)*100)}%`).join(', ')):(t.effect||'—');
    el.appendChild(info);
    const btn=document.createElement('button'); btn.className='btn'; btn.textContent=taken? 'Pris' : `Rechercher (${t.cost} science)`;
    btn.disabled = taken || state.science < t.cost;
    btn.addEventListener('click', ()=>{
      if(state.science < t.cost || state.tech[t.id]) return;
      state.science -= t.cost; state.tech[t.id]=true; applyTechEffects(t); setState({ science: state.science, tech: state.tech, techBonus: state.techBonus }); renderTech();
    });
    el.appendChild(btn);
    list.appendChild(el);
  });
}
function applyTechEffects(t){
  if(t.bonus){ for(const [k,v] of Object.entries(t.bonus)){ state.techBonus[k]=(state.techBonus[k]||1)*v; } }
  if(t.effect==='+cap50'){ state.woodCap+=50; state.stoneCap+=50; }
  if(t.effect==='market+10'){ state.tech['log']=true; }
}

/* ===================== PRESTIGE ===================== */
function initPrestige(){
  byId('prestigeBtn').addEventListener('click', ()=> openModal('prestigeModal'));
  byId('prestigeBackdrop').addEventListener('click', ()=> closeModal('prestigeModal'));
  byId('prestigeClose').addEventListener('click', ()=> closeModal('prestigeModal'));
  byId('doPrestige').addEventListener('click', doPrestige);
  updatePP(); renderSkillTree();
}
function updatePP(){ text('pp', state.prestigePoints); if(ppHdr) ppHdr.textContent=state.prestigePoints; if(prestigeHdr) prestigeHdr.textContent=state.prestige; }

function renderSkillTree(){
  const root = byId('skillTree'); if(!root) return; root.innerHTML='';
  CONFIG.SKILL_TREE.forEach(t=>{
    const tierBox=document.createElement('div'); tierBox.className='skill-tier';
    const lbl=document.createElement('div'); lbl.className='label';
    const takenInTier = Object.keys(state.prestigeTaken).filter(id=>id.startsWith('t'+t.tier+':')).length;
    lbl.textContent = `Palier ${t.tier} — besoin d'en prendre ${t.reqTaken} au palier ${t.tier-1}`;
    tierBox.appendChild(lbl);
    t.nodes.forEach(n=>{
      const id=`t${t.tier}:${n.id}`; const taken=!!state.prestigeTaken[id];
      const el=document.createElement('div'); el.className='skill-node';
      el.classList.toggle('taken', taken);
      const canOpen = isTierAvailable(t.tier) && !taken && state.prestigePoints>=n.cost;
      el.classList.toggle('locked', !canOpen);
      el.dataset.id=id; el.dataset.tier=t.tier; el.dataset.cost=n.cost;
      el.innerHTML = `<div class='name'>${n.name}</div><div class='cost'>${n.cost} PP</div><div class='req small muted'>${n.desc||''}</div>`;
      el.addEventListener('click', ()=>{ if(!isTierAvailable(t.tier) || taken) return; if(state.prestigePoints<n.cost) return; takeSkill(t, n); });
      tierBox.appendChild(el);
    });
    root.appendChild(tierBox);
  });
}
function isTierAvailable(tier){
  if(tier===1) return true;
  const prev = CONFIG.SKILL_TREE.find(x=>x.tier===tier-1);
  const takenPrev = Object.keys(state.prestigeTaken).filter(id=>id.startsWith('t'+(tier-1)+':')).length;
  return takenPrev >= (prev? prev.reqTaken : 0);
}
function takeSkill(t, n){
  const id=`t${t.tier}:${n.id}`; if(state.prestigeTaken[id]) return;
  if(!isTierAvailable(t.tier)) return; if(state.prestigePoints<n.cost) return;
  state.prestigePoints -= n.cost; state.prestigeTaken[id]=true; applySkillEffect(n.effect);
  updatePP(); renderSkillTree(); refreshAll(); updateBuildButtons(); save();
}


function applySkillEffect(effectSpec){
  if(!effectSpec) return;
  const effs = effectSpec.split(';');
  effs.forEach(e=>{
    if(e==='foremanUnlock'){ state.achievements['foremanUnlock']=true; updateForemanUI(); return; }
    let [k,v] = e.split(/(\+|->)/); // e.g., 'crit+0.03' or 'hold->4.0'
    if(!v){ return; }
    const op = e.includes('->') ? '->' : '+';
    const num = parseFloat(e.split(op)[1]);
    switch(true){
      case k==='crit': state.prestigeEffects.critAdd = (state.prestigeEffects.critAdd||0) + num; break;
      case k==='hold' && op==='->': state.prestigeEffects.holdMult = num; break;
      case k==='staminaRegen': state.prestigeEffects.staminaRegenAdd = (state.prestigeEffects.staminaRegenAdd||0) + num; break;
      case k==='staminaMax': state.prestigeEffects.staminaMaxAdd = (state.prestigeEffects.staminaMaxAdd||0) + num; break;
      case k==='foreSpeed': state.prestigeEffects.foremanSpeed = (state.prestigeEffects.foremanSpeed||1) * (1+num); break; // num is 0.25 => *1.25
      case k==='market': state.prestigeEffects.marketAdd = (state.prestigeEffects.marketAdd||0) + num; break;
      case k==='cap': state.woodCap += num; state.stoneCap += num; break;
      case k==='libMult': state.prestigeEffects.libraryMult = (state.prestigeEffects.libraryMult||1) * (1+num); break;
      case k==='double': state.prestigeEffects.doubleChance = (state.prestigeEffects.doubleChance||0) + num; break;
      case k==='event': state.prestigeEffects.eventExtra = (state.prestigeEffects.eventExtra||0) + num; break;
      case k==='pp': state.prestigeEffects.ppMult = (state.prestigeEffects.ppMult||1) * (1+num); break;
      case k==='global': state.prestigeEffects.mult.global = (state.prestigeEffects.mult.global||1) * (1+num); break;
      case k==='castle': state.prestigeEffects.mult.castle = (state.prestigeEffects.mult.castle||1) * (1+num); break;
      case k==='field': state.prestigeEffects.mult.field = (state.prestigeEffects.mult.field||1) * (1+num); break;
      case k==='camp': state.prestigeEffects.mult.camp = (state.prestigeEffects.mult.camp||1) * (1+num); break;
      case k==='mine': state.prestigeEffects.mult.mine = (state.prestigeEffects.mult.mine||1) * (1+num); break;
      case k==='artifact': state.prestigeEffects.artifactBonus = (state.prestigeEffects.artifactBonus||0) + num; break;
    }
  });
}

function resetForPrestige(){
  const keep={ version: state.version, prestige: state.prestige+1, prestigePoints: state.prestigePoints, achievements: state.achievements, artifacts: state.artifacts, artBonus: state.artBonus, prestigeTaken: state.prestigeTaken, prestigeEffects: state.prestigeEffects };
  const fresh={
    gold:0, wood:0, stone:0, wheat:0, science:0, pop:0,
    woodCap: CONFIG.STORAGE.woodCap, stoneCap: CONFIG.STORAGE.stoneCap,
    zoneRadius: CONFIG.GRID.startRadius, zoneLevel:1, zoneBonus:{}, zoneName:'Campement',
    castleBuilt:false, castleLevel:1,
    houses:0, fields:0, camps:0, mines:0, mills:0, warehouses:0, markets:0, libraries:0,
    foreman:{ built:false, level:0, on:false, clicksPerSec:1, wheatPerMin:5 },
    stamina:{ castle:100, field:100, camp:100, mine:100 },
    levels:{ field:1, camp:1, mine:1 },
    occupied:[], housePositions:[], fieldPositions:[], campPositions:[], minePositions:[],
    millPositions:[], warePositions:[], marketPositions:[], libraryPositions:[],
    treePositions:[], rockPositions:[],
    globalMult:1.0,
    event:{ id:null, label:'Aucun événement', timeLeft:0, mult:{}, marketBonus:0 },
    tech:{}, techBonus:{},
    clicks:{castle:0,field:0,camp:0,mine:0,library:0},
    totals:{gold:0,wheat:0,wood:0,stone:0,science:0},
    quests:{},
    market:{ wheat:0.8, wood:0.6, stone:0.7 },
    boss:{ active:false, hp:0, max:0, index:null, name:'' },
  };
  Object.assign(state, fresh, keep);
  repaintFromState(); refreshAll(); updateForemanUI(); updatePP();
}
function doPrestige(){
  if(state.castleLevel < 10){ alert('Prestige verrouillé: Château niveau 10 requis.'); return; }
  let pointsGained = Math.floor(Math.max(0, state.gold)/100);
  pointsGained = Math.floor(pointsGained * (state.prestigeEffects.ppMult||1));
  state.prestigePoints += pointsGained;
  resetForPrestige();
  closeModal('prestigeModal');
}
function spendPoint(id, nodeEl){
  if(state.prestigePoints<=0) return;
  if(nodeEl.classList.contains('taken')) return;
  nodeEl.classList.add('taken');
  state.prestigePoints -= 1;
  if(id==='foremanUnlock'){ state.achievements['foremanUnlock']=true; }
  if(id==='foremanSpeed'){ state.foreman.clicksPerSec *= 1.25; }
  if(id==='stamina'){ state.globalMult *= 1.02; }
  if(id==='crit'){ state.achievements['critPlus']=true; }
  if(id==='hold'){ CONFIG.CLICK.holdMult = 3.5; }
  if(id==='global'){ state.globalMult *= 1.05; }
  updatePP();
}

/* ===================== ACHIEVEMENTS & QUESTS ===================== */
const ACHIEVEMENTS = [
  { id:'firstGold',   name:'Premières pièces', cond: s=> s.totals.gold>=10,     bonus: s=> state.globalMult*=1.01 },
  { id:'field100',    name:'Fermier',          cond: s=> s.clicks.field>=100,   bonus: s=> state.globalMult*=1.01 },
  { id:'wood100',     name:'Bûcheron',         cond: s=> s.clicks.camp>=100,    bonus: s=> state.globalMult*=1.01 },
  { id:'stone100',    name:'Mineur',           cond: s=> s.clicks.mine>=100,    bonus: s=> state.globalMult*=1.01 },
  { id:'critPlus',    name:'Visée',            cond: s=> (s.totals.gold+s.totals.wood+s.totals.stone)>=200, bonus: s=> { s.achievements['critPlus']=true; } },
  { id:'foremanUnlock', name:'Chef d\'équipe', cond: s=> s.prestige>=1, bonus: s=> { s.achievements['foremanUnlock']=true; } },
];
function checkAchievements(){
  let unlocked=[];
  for(const a of ACHIEVEMENTS){
    if(state.achievements[a.id]) continue;
    if(a.cond(state)){ state.achievements[a.id]=true; a.bonus(state); unlocked.push(a.name); }
  }
  if(unlocked.length>0){ const list=byId('achList'); const item=document.createElement('div'); item.textContent=`Nouveaux succès: ${unlocked.join(', ')}`; list.prepend(item); }
}
const QUESTS = [
  { id:'q_gold100',  name:'Amasser 100 or',     cond: s=> s.totals.gold>=100,   reward: s=> state.gold+=25 },
  { id:'q_wheat200', name:'Récolter 200 blé',   cond: s=> s.totals.wheat>=200,  reward: s=> state.globalMult*=1.02 },
  { id:'q_wood200',  name:'Couper 200 bois',    cond: s=> s.totals.wood>=200,   reward: s=> state.woodCap+=50 },
  { id:'q_stone200', name:'Extraire 200 pierre',cond: s=> s.totals.stone>=200,  reward: s=> state.stoneCap+=50 },
  { id:'q_sci100',   name:'Étudier 100 science',cond: s=> s.totals.science>=100,reward: s=> state.globalMult*=1.03 },
];
function initQuests(){
  byId('questBtn').addEventListener('click', ()=>{ openModal('questModal'); renderQuests(); });
  byId('questBackdrop').addEventListener('click', ()=> closeModal('questModal'));
  byId('questClose').addEventListener('click', ()=> closeModal('questModal'));
}
function renderQuests(){
  const list=byId('questList'); list.innerHTML='';
  QUESTS.forEach(q=>{
    const done=!!state.quests[q.id];
    const el=document.createElement('div'); el.className='modal-section';
    el.innerHTML = `<div>${q.name} ${done?'<span class="small muted">[réclamée]</span>':''}</div>`;
    const b=document.createElement('button'); b.className='btn'; b.textContent=done?'Obtenue':'Réclamer';
    b.disabled = done || !q.cond(state);
    b.addEventListener('click', ()=>{
      if(q.cond(state) && !state.quests[q.id]){ q.reward(state); state.quests[q.id]=true; renderQuests(); refreshHeader(); }
    });
    el.appendChild(b); list.appendChild(el);
  });
}

/* ===================== UI (Header/Menu/Admin) ===================== */
// Elements
const goldEl=byId('gold'), woodEl=byId('wood'), stoneEl=byId('stone'), wheatEl=byId('wheat'), sciEl=byId('science'), woodCapEl=byId('woodCap'), stoneCapEl=byId('stoneCap'), popEl=byId('pop');
const woodBar=byId('woodBar'), stoneBar=byId('stoneBar'); const versionEl=byId('version');
function initUI(){
  versionEl.textContent=`v${state.version.major}.${state.version.minor}${state.version.suffix}`;
  byId('menuBtn').addEventListener('click', ()=> openModal('menuModal'));
  byId('adminBtn').addEventListener('click', ()=>{ openModal('menuModal'); setTimeout(()=> byId('adminSection').scrollIntoView({behavior:'smooth'}), 50); });
  byId('menuBackdrop').addEventListener('click', ()=> closeModal('menuModal'));
  byId('menuClose').addEventListener('click', ()=> closeModal('menuModal'));

  byId('resetBtn').addEventListener('click', ()=>{ if(confirm('Réinitialiser la partie ?')){ localStorage.removeItem(CONFIG.SAVE_KEY); location.reload(); } });
  byId('exportBtn').addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(state)], {type:'application/json'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='save.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url), 1000);
  });
  byId('importBtn').addEventListener('click', ()=>{
    const f=byId('importInput').files && byId('importInput').files[0]; if(!f) return;
    const reader=new FileReader(); reader.onload=(e)=>{ try{ const data=JSON.parse(e.target.result); Object.assign(state, data); save(); location.reload(); }catch(_){ alert('Import invalide'); } }; reader.readAsText(f);
  });

  // Admin quick add
  addResourceHandlers();

  // Ach modal
  byId('achBtn').addEventListener('click', ()=> openModal('achModal'));
  byId('achBackdrop').addEventListener('click', ()=> closeModal('achModal'));
  byId('achClose').addEventListener('click', ()=> closeModal('achModal'));
}
function addResourceHandlers(){
  const addX=(key, el)=>()=>{ const v=parseFloat(el.value)||0; state[key]=(state[key]||0)+v; refreshHeader(); };
  byId('addGoldBtn').addEventListener('click', addX('gold', byId('goldAmt')));
  byId('addWoodBtn').addEventListener('click', addX('wood', byId('woodAmt')));
  byId('addStoneBtn').addEventListener('click', addX('stone', byId('stoneAmt')));
  byId('addWheatBtn').addEventListener('click', addX('wheat', byId('wheatAmt')));
  byId('addScienceBtn').addEventListener('click', addX('science', byId('scienceAmt')));
  byId('addPopBtn').addEventListener('click', ()=>{ const v=parseInt(byId('popAmt').value)||0; state.pop += v; refreshHeader(); });
  byId('addGold10').addEventListener('click', ()=>{ state.gold+=10; refreshHeader(); });
  byId('addGold100').addEventListener('click', ()=>{ state.gold+=100; refreshHeader(); });
  byId('addGold1k').addEventListener('click', ()=>{ state.gold+=1000; refreshHeader(); });
  byId('addWood10').addEventListener('click', ()=>{ state.wood+=10; refreshHeader(); });
  byId('addWood100').addEventListener('click', ()=>{ state.wood+=100; refreshHeader(); });
  byId('addWood1k').addEventListener('click', ()=>{ state.wood+=1000; refreshHeader(); });
  byId('addStone10').addEventListener('click', ()=>{ state.stone+=10; refreshHeader(); });
  byId('addStone100').addEventListener('click', ()=>{ state.stone+=100; refreshHeader(); });
  byId('addStone1k').addEventListener('click', ()=>{ state.stone+=1000; refreshHeader(); });
  byId('addWheat10').addEventListener('click', ()=>{ state.wheat+=10; refreshHeader(); });
  byId('addWheat100').addEventListener('click', ()=>{ state.wheat+=100; refreshHeader(); });
  byId('addWheat1k').addEventListener('click', ()=>{ state.wheat+=1000; refreshHeader(); });
  byId('bumpPatch').addEventListener('click', ()=>{ bumpPatch(state.version); versionEl.textContent=`v${state.version.major}.${state.version.minor}${state.version.suffix}`; });
}
function refreshHeader(){
  if(prestigeHdr) prestigeHdr.textContent = state.prestige;
  if(ppHdr) ppHdr.textContent = state.prestigePoints;
  updateBuildButtons();
  goldEl.textContent=(Math.round(state.gold*100)/100).toString();
  woodEl.textContent=Math.floor(state.wood);
  stoneEl.textContent=Math.floor(state.stone);
  wheatEl.textContent=(Math.round(state.wheat*100)/100).toString();
  sciEl.textContent=(Math.round(state.science*100)/100).toString();
  woodCapEl.textContent=state.woodCap;
  stoneCapEl.textContent=state.stoneCap;
  popEl.textContent=state.pop;
  woodBar.style.width=Math.min(100, (state.wood/state.woodCap)*100)+'%';
  stoneBar.style.width=Math.min(100, (state.stone/state.stoneCap)*100)+'%';
}

/* ===================== TIMERS ===================== */
function startTimers(){
  setInterval(save, 5000);
  setInterval(()=>{ // stamina regen
    const max=CONFIG.CLICK.staminaMax + (state.prestigeEffects.staminaMaxAdd||0), regen=CONFIG.CLICK.staminaRegenPerSec + (state.prestigeEffects.staminaRegenAdd||0);
    state.stamina.castle=Math.min(max, (state.stamina.castle||0)+regen);
    state.stamina.field =Math.min(max, (state.stamina.field ||0)+regen);
    state.stamina.camp  =Math.min(max, (state.stamina.camp  ||0)+regen);
    state.stamina.mine  =Math.min(max, (state.stamina.mine  ||0)+regen);
    refreshAll();
  }, 1000);
  setInterval(checkAchievements, 1500);
  setInterval(tickMarketDrift, 4000);
  setInterval(setDepletedClass, 1000);
  startEvents();
  // foreman
  let acc=0;
  setInterval(()=>{
    if(!state.foreman.built || !state.foreman.on) return;
    const cps=state.foreman.clicksPerSec * (state.prestigeEffects.foremanSpeed||1); acc += 0.1*cps;
    const consumePerTick=(state.foreman.wheatPerMin/60)*0.1;
    if(state.wheat < consumePerTick) return;
    state.wheat -= consumePerTick; refreshHeader();
    while(acc>=1){
      acc-=1;
      const producers=[];
      if(state.castleBuilt) producers.push(board.children[getCenterIndex()]);
      [...state.fieldPositions, ...state.campPositions, ...state.minePositions].forEach(i=> producers.push(board.children[i]));
      if(producers.length===0) break;
      const el=producers[Math.floor(Math.random()*producers.length)];
      el && el.click();
    }
  }, 100);
}

/* ===================== HELPERS ===================== */
function byId(id){ return document.getElementById(id); }
function text(id, val){ const el=byId(id); if(el) el.textContent=val; }
function show(id){ const el=byId(id); if(el) el.style.display=''; }
function hide(id){ const el=byId(id); if(el) el.style.display='none'; }
function openModal(id){ byId(id).classList.add('open'); }
function closeModal(id){ byId(id).classList.remove('open'); }
function clamp(v,min,max){ return Math.max(min, Math.min(max,v)); }
function progressFill(id, ms){ const el=byId(id); if(!el) return; el.style.transition='none'; el.style.width='0%'; requestAnimationFrame(()=>{ el.style.transition=`width ${ms}ms linear`; el.style.width='100%'; }); }
function resetFill(id){ const el=byId(id); if(!el) return; el.style.transition='none'; el.style.width='0%'; }
function disableBtn(id,b){ const el=byId(id); if(el) el.disabled=b; }

/* ===================== MENU/INIT ===================== */
function start(){
  load();

  try{ if(!localStorage.getItem(CONFIG.SAVE_KEY)){ state.gold = Math.max(state.gold||0, 10); } }catch(e){}
  initGrid();
  initUI();
  setupBuildButtons();
  initPrestige();
  initQuests();
  initZones();
  initTech();
  // art modal
  byId('artBtn').addEventListener('click', ()=>{ openModal('artModal'); renderArtifacts(); });
  byId('artBackdrop').addEventListener('click', ()=> closeModal('artModal'));
  byId('artClose').addEventListener('click', ()=> closeModal('artModal'));

  // repaint & init
  placeNaturalResources();
  repaintFromState();
  refreshAll();
  updateMarketPrices();
  refreshHeader();
  startTimers();
}
start();

})(); // end IIFE
