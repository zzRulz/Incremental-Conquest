// ======= Modèle simple incremental par tours =======
const CELL = { NEUTRAL:0, PLAYER:1, ENEMY:2 };
const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];
const SAVE_KEY = 'inc_v3_split';

const state = {
  n: 10,
  board: [],
  hp: [],
  turn: 0,
  gold: 1,           // démarre à 1 gold
  peasants: 0,       // chaque paysan remplit 1 champ = +1 or/ tour
  footmen: 0,        // tentatives de capture / tour
  farmCap: 30,       // nombre de cases champ affichées
  castles: {player:[0,0], enemy:[0,0]},
  victoryMode: 'castle',
  // Probabilités de conquête (fantassins)
  pNeutral: 0.65,
  pEnemy:   0.40,
  defP: 1, defE: 2,  // PV cases capturées
};

// ---- PV de terrain (neutres) : faible au bord, fort au centre ----
const MIN_EDGE_HP   = 4;   // HP minimum sur les bords
const MAX_CENTER_HP = 10;  // HP au centre
function neutralHPFor(i, j){
  const midCol = Math.floor(state.n/2);
  const d = Math.abs(j - midCol) / Math.max(1, midCol); // 0 au centre, ~1 aux bords
  const hp = Math.round(MIN_EDGE_HP + (MAX_CENTER_HP - MIN_EDGE_HP) * (1 - d));
  return hp;
}

function inb(n,x,y){ return x>=0 && x<n && y>=0 && y<n; }
function neighbors(n,x,y){
  const out=[]; for(const [dx,dy] of DIRS){ const nx=x+dx,ny=y+dy; if(inb(n,nx,ny)) out.push([nx,ny]); } return out;
}
function newBoard(n){
  const B = Array.from({length:n}, _ => Array(n).fill(CELL.NEUTRAL));
  const mid = Math.floor(n/2);
  // IA à gauche, joueur à droite
  state.castles.enemy  = [mid, 0];
  state.castles.player = [mid, n-1];
  const [ex,ey] = state.castles.enemy;
  const [px,py] = state.castles.player;
  B[ex][ey] = CELL.ENEMY;
  B[px][py] = CELL.PLAYER;
  return B;
}
function newHP(n, defP, defE){
  // Initialise les HP de toute la carte avec gradient neutre
  const H = Array.from({length:n}, _ => Array(n).fill(1));
  for(let i=0;i<n;i++){
    for(let j=0;j<n;j++){
      H[i][j] = neutralHPFor(i, j);
    }
  }
  // Châteaux un peu plus tanky
  const [ex,ey] = state.castles.enemy;
  const [px,py] = state.castles.player;
  H[px][py] = Math.max(defP, defP + 2);
  H[ex][ey] = Math.max(defE, defE + 2);
  return H;
}
function countCells(who){ let c=0; for(const r of state.board) for(const v of r) if(v===who) c++; return c; }
function frontierFor(who){
  const n=state.n, seen=new Set(), out=[];
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){
    if(state.board[i][j]!==who) continue;
    for(const [nx,ny] of neighbors(n,i,j)){
      if(state.board[nx][ny]!==who){
        const k=nx+','+ny;
        if(!seen.has(k)){ seen.add(k); out.push([nx,ny]); }
      }
    }
  }
  return out;
}

// ======= Économie =======
function incomePerTurn(){
  // incremental : uniquement les champs rapportent
  return state.peasants * 1;
}
function buyPeasant(){
  const cost = 1;
  if(state.gold < cost) return false;
  if(state.peasants >= state.farmCap) { log('Capacité de champs atteinte.'); return false; }
  state.gold -= cost;
  state.peasants += 1;
  log('👨\u200d🌾 +1 paysan → un champ est cultivé ( +1 or/ tour )');
  return true;
}
function buyFootman(){
  const cost = 10; // cher pour rythme lent
  if(state.gold < cost) return false;
  state.gold -= cost;
  state.footmen += 1;
  log('🛡️ +1 fantassin (1 tentative de capture par tour).');
  return true;
}

// ======= Conquête (fantassins seulement) =======
function playerAutoConquer(){
  const attempts = state.footmen;
  if(attempts<=0) return 0;
  const front = frontierFor(CELL.PLAYER);
  if(front.length===0) return 0;
  let caps=0;
  for(let k=0;k<attempts;k++){
    if(front.length===0) break;
    const [x,y] = front[Math.floor(Math.random()*front.length)];
    const target = state.board[x][y];
    const p = (target===CELL.NEUTRAL)?state.pNeutral:state.pEnemy;
    if(Math.random() < p){
      state.hp[x][y] = Math.max(0, (state.hp[x][y]||1)-1);
      if(state.hp[x][y]===0){
        state.board[x][y]=CELL.PLAYER;
        state.hp[x][y]=state.defP;
        caps++;
      }
    }
  }
  return caps;
}
function enemyAutoExpand(){
  // IA lente → 1 tentative/ tour si elle a au moins 5 cases
  const enemyCount = countCells(CELL.ENEMY);
  if(enemyCount < 5) return 0;
  const front = frontierFor(CELL.ENEMY);
  if(front.length===0) return 0;
  let caps=0;
  const [x,y] = front[Math.floor(Math.random()*front.length)];
  const p = (state.board[x][y]===CELL.NEUTRAL)?0.55:0.35;
  if(Math.random()<p){
    state.hp[x][y] = Math.max(0, (state.hp[x][y]||1)-1);
    if(state.hp[x][y]===0){
      state.board[x][y]=CELL.ENEMY;
      state.hp[x][y]=state.defE;
      caps++;
    }
  }
  return caps;
}

// ======= Tour =======
function endTurn(){
  state.turn++;
  // PROD
  const inc = incomePerTurn();
  state.gold += inc;
  // CONQUÊTE
  const p = playerAutoConquer();
  const e = enemyAutoExpand();
  // Victoire / défaite selon mode
  if(state.victoryMode==='castle'){
    const [ex,ey] = state.castles.enemy;
    const [px,py] = state.castles.player;
    if(state.board[ex][ey] === CELL.PLAYER){ log(`🎉 Victoire (château ennemi) au tour ${state.turn}`); }
    if(state.board[px][py] !== CELL.PLAYER){ log(`💀 Défaite (ton château est tombé) au tour ${state.turn}`); }
  }else{
    const tot = state.n*state.n, me=countCells(CELL.PLAYER);
    if(me===tot) log(`🎉 Victoire par conquête totale au tour ${state.turn}`);
    if(me===0)   log(`💀 Défaite : plus de territoire au tour ${state.turn}`);
  }
  log(`Tour ${state.turn}: +${inc} or | captures → toi ${p}, IA ${e}`);
  render(); save();
}

// ======= UI =======
const el = {
  board: document.getElementById('board'),
  gold: document.getElementById('goldStat'),
  income: document.getElementById('incomeStat'),
  turn: document.getElementById('turnStat'),
  step: document.getElementById('stepBtn'),
  reset: document.getElementById('resetBtn'),
  buyP: document.getElementById('buyPeasant'),
  buyF: document.getElementById('buyFootman'),
  pCount: document.getElementById('peasantCount'),
  fCount: document.getElementById('footmanCount'),
  farmGrid: document.getElementById('farmGrid'),
  farmCapLabel: document.getElementById('farmCapLabel'),
  sizeInput: document.getElementById('sizeInput'),
  resizeBtn: document.getElementById('resizeBtn'),
  gridSizeLabel: document.getElementById('gridSizeLabel'),
  log: document.getElementById('logBox'),
  victory: document.getElementById('victoryMode'),
};

function renderBoard(){
  const n = state.n;
  el.board.style.gridTemplateColumns = `repeat(${n}, var(--tile))`;
  el.board.innerHTML='';
  for(let i=0;i<n;i++){
    for(let j=0;j<n;j++){
      const v = state.board[i][j];
      const d = document.createElement('div');
      d.className = 'cell ' + (v===CELL.NEUTRAL?'neutral':v===CELL.PLAYER?'player':'enemy');
      const isPC = (i===state.castles.player[0] && j===state.castles.player[1]);
      const isEC = (i===state.castles.enemy[0]  && j===state.castles.enemy[1]);
      d.textContent = (v===CELL.NEUTRAL)?'🏳':(v===CELL.PLAYER?(isPC?'🏰':'🟩'):(isEC?'🏯':'🟥'));
      d.title = `PV: ${state.hp[i]?.[j] ?? 1}`;
      el.board.appendChild(d);
    }
  }
}
function renderFarms(){
  el.farmGrid.innerHTML='';
  el.farmCapLabel.textContent = state.farmCap;
  for(let i=0;i<state.farmCap;i++){
    const f = document.createElement('div');
    f.className = 'farm' + (i < state.peasants ? ' filled':'');
    f.textContent = (i < state.peasants) ? '🌾' : '▢';
    el.farmGrid.appendChild(f);
  }
}
function render(){
  el.gold.textContent = `Or: ${state.gold}`;
  el.income.textContent = `Revenu/tour: ${incomePerTurn()}`;
  el.turn.textContent = `Tour: ${state.turn}`;
  el.pCount.textContent = `${state.peasants} paysan${state.peasants>1?'s':''}`;
  el.fCount.textContent = `${state.footmen} fantassin${state.footmen>1?'s':''}`;
  el.gridSizeLabel.textContent = `${state.n}×${state.n}`;
  el.victory.value = state.victoryMode;
  renderBoard();
  renderFarms();
  el.buyP.disabled = !(state.gold >= 1 && state.peasants < state.farmCap);
  el.buyF.disabled = !(state.gold >= 10);
}
function log(msg){
  const t = new Date().toLocaleTimeString();
  el.log.textContent = `[${t}] ${msg}\n` + el.log.textContent;
}

// ======= Save / Load / Reset =======
function save(){
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }catch(e){}
}
function load(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const s = JSON.parse(raw);
    Object.assign(state, s);
    if(!state.board || state.board.length!==state.n){ state.board = newBoard(state.n); }
    if(!state.hp || state.hp.length!==state.n){ state.hp = newHP(state.n, state.defP, state.defE); }
    return true;
  }catch(e){ return false; }
}
function hardReset(){
  Object.assign(state, {
    n:10, board:newBoard(10), hp:[], turn:0,
    gold:1, peasants:0, footmen:0, farmCap:30,
    castles: state.castles, victoryMode:'castle',
    pNeutral:0.65, pEnemy:0.40, defP:1, defE:2
  });
  state.hp = newHP(state.n, state.defP, state.defE);
  document.getElementById('sizeInput').value = state.n;
  render(); save();
  log('Réinitialisation de la partie.');
}

// ======= Events =======
document.getElementById('buyPeasant').addEventListener('click', ()=>{ if(buyPeasant()){ render(); save(); } });
document.getElementById('buyFootman').addEventListener('click', ()=>{ if(buyFootman()){ render(); save(); } });
document.getElementById('stepBtn').addEventListener('click', endTurn);
document.getElementById('resetBtn').addEventListener('click', hardReset);
document.getElementById('resizeBtn').addEventListener('click', ()=>{
  let n = parseInt(document.getElementById('sizeInput').value||'10',10);
  n = Math.max(7, Math.min(25, n));
  state.n = n;
  state.board = newBoard(n);
  state.hp = newHP(n, state.defP, state.defE);
  state.turn = 0;
  render(); save();
  log(`Nouvelle grille ${n}×${n}.`);
});
document.getElementById('victoryMode').addEventListener('change', (e)=>{
  state.victoryMode = e.target.value;
  save();
  log(`Condition de victoire: ${state.victoryMode==='castle'?'Capture du château':'Conquête totale'}`);
});

// ======= Init =======
(function init(){
  if(!load()){
    state.board = newBoard(state.n);
    state.hp = newHP(state.n, state.defP, state.defE);
  }
  document.getElementById('sizeInput').value = state.n;
  render();
  if(state.turn===0){
    log("Bienvenue ! Tour 0 — Tu as 1 or. Achète un paysan (1 or) pour remplir ton 1er champ.");
  }
})();
