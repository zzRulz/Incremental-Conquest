// Multiplayer 1v1 using Firebase Realtime Database
// Requires a firebase-config.js module exporting { firebaseConfig }
// If you don't have it yet, copy firebase-config.sample.js to firebase-config.js and fill your keys.

import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase, ref, onValue, set, update, get, child } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// ======= Core game (same base as previous incremental) =======
const CELL = { NEUTRAL:0, PLAYER:1, ENEMY:2 };
const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];
const SAVE_KEY = 'inc_v4_mp_local';

const MIN_EDGE_HP   = 4;
const MAX_CENTER_HP = 10;

const state = {
  n: 10,
  board: [],
  hp: [],
  turn: 0,
  // per-player economy (J1/J2)
  p1: { gold:1, peasants:0, footmen:0, farmCap:30 },
  p2: { gold:1, peasants:0, footmen:0, farmCap:30 },
  castles: { p1:[0,0], p2:[0,0] },
  victoryMode: 'castle',
  pNeutral: 0.65,
  pEnemy:   0.40,
  defP: 1, defE: 2,
  // MP
  mp: { online:false, role:null, room:null, myId:null, active:'p1' } // role: 'p1' or 'p2'
};

// Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function neutralHPFor(i, j){
  const midCol = Math.floor(state.n/2);
  const d = Math.abs(j - midCol) / Math.max(1, midCol);
  return Math.round(MIN_EDGE_HP + (MAX_CENTER_HP - MIN_EDGE_HP) * (1 - d));
}
function inb(n,x,y){ return x>=0 && x<n && y>=0 && y<n; }
function neighbors(n,x,y){
  const out=[]; for(const [dx,dy] of DIRS){ const nx=x+dx,ny=y+dy; if(inb(n,nx,ny)) out.push([nx,ny]); } return out;
}
function newBoard(n){
  const B = Array.from({length:n}, _ => Array(n).fill(CELL.NEUTRAL));
  const mid = Math.floor(n/2);
  state.castles.p2  = [mid, 0];      // gauche = P2
  state.castles.p1 = [mid, n-1];     // droite = P1
  const [eX,eY] = state.castles.p2;
  const [pX,pY] = state.castles.p1;
  B[eX][eY] = CELL.ENEMY;
  B[pX][pY] = CELL.PLAYER;
  return B;
}
function newHP(n, defP, defE){
  const H = Array.from({length:n}, _ => Array(n).fill(1));
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) H[i][j] = neutralHPFor(i,j);
  const [eX,eY] = state.castles.p2;
  const [pX,pY] = state.castles.p1;
  H[pX][pY] = Math.max(defP, defP+2);
  H[eX][eY] = Math.max(defE, defE+2);
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

// Economy
function incomePerTurn(role){ const p = role==='p1'?state.p1:state.p2; return p.peasants; }
function buyPeasant(role){
  const p = role==='p1'?state.p1:state.p2;
  if(p.gold < 1) return false;
  if(p.peasants >= p.farmCap) return false;
  p.gold -= 1; p.peasants += 1; log(role, '👨‍🌾 +1 paysan → +1 champ');
  return true;
}
function buyFootman(role){
  const p = role==='p1'?state.p1:state.p2;
  if(p.gold < 10) return false;
  p.gold -= 10; p.footmen += 1; log(role, '🛡️ +1 fantassin');
  return true;
}

// Conquest (footmen only)
function playerAutoConquer(role){
  const attempts = (role==='p1'?state.p1:state.p2).footmen;
  if(attempts<=0) return 0;
  const front = frontierFor(role==='p1'?CELL.PLAYER:CELL.ENEMY);
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
        state.board[x][y] = (role==='p1'?CELL.PLAYER:CELL.ENEMY);
        state.hp[x][y] = (role==='p1'?state.defP:state.defE);
        caps++;
      }
    }
  }
  return caps;
}

// One full turn for the active player
function endTurn(){
  const role = state.mp.online ? state.mp.active : 'p1'; // in solo, only p1 plays
  const me = role==='p1'?state.p1:state.p2;
  state.turn++;
  me.gold += incomePerTurn(role);
  const caps = playerAutoConquer(role);

  // Victory checks (castle mode)
  const [eX,eY] = state.castles.p2, [pX,pY] = state.castles.p1;
  if(state.victoryMode==='castle'){
    if(state.board[eX][eY] === CELL.PLAYER){ log(role, `🎉 Victoire P1 (château P2) au tour ${state.turn}`); }
    if(state.board[pX][pY] !== CELL.PLAYER){ log(role, `🎉 Victoire P2 (château P1) au tour ${state.turn}`); }
  }

  log(role, `Fin tour ${state.turn} : +${incomePerTurn(role)} or • captures ${caps}`);

  // Switch turn
  if(state.mp.online){
    state.mp.active = (state.mp.active==='p1')?'p2':'p1';
    pushRoomState();
  } else {
    render(); saveLocal();
  }
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
  room: document.getElementById('roomInput'),
  createBtn: document.getElementById('createBtn'),
  joinBtn: document.getElementById('joinBtn'),
  roomInfo: document.getElementById('roomInfo'),
  mpRole: document.getElementById('mpRole'),
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
      const isP1C = (i===state.castles.p1[0] && j===state.castles.p1[1]);
      const isP2C = (i===state.castles.p2[0] && j===state.castles.p2[1]);
      d.textContent = (v===CELL.NEUTRAL)?'🏳':(v===CELL.PLAYER?(isP1C?'🏰':'🟩'):(isP2C?'🏯':'🟥'));
      d.title = `PV: ${state.hp[i]?.[j] ?? 1}`;
      el.board.appendChild(d);
    }
  }
}
function renderFarms(){
  el.farmGrid.innerHTML='';
  el.farmCapLabel.textContent = (myRole()==='p1'?state.p1.farmCap:state.p2.farmCap);
  const peasants = (myRole()==='p1'?state.p1.peasants:state.p2.peasants);
  const cap = (myRole()==='p1'?state.p1.farmCap:state.p2.farmCap);
  for(let i=0;i<cap;i++){
    const f = document.createElement('div');
    f.className = 'farm' + (i < peasants ? ' filled':'');
    f.textContent = (i < peasants) ? '🌾' : '▢';
    el.farmGrid.appendChild(f);
  }
}
function myRole(){ return state.mp.online ? state.mp.role : 'p1'; }

function render(){
  const role = myRole();
  const me = role==='p1'?state.p1:state.p2;
  el.gold.textContent = `Or: ${me.gold}`;
  el.income.textContent = `Revenu/tour: ${incomePerTurn(role)}`;
  el.turn.textContent = `Tour: ${state.turn}`;
  el.pCount.textContent = `${me.peasants} paysan${me.peasants>1?'s':''}`;
  el.fCount.textContent = `${me.footmen} fantassin${me.footmen>1?'s':''}`;
  el.gridSizeLabel.textContent = `${state.n}×${state.n}`;
  el.victory.value = state.victoryMode;
  el.mpRole.textContent = state.mp.online ? (state.mp.role==='p1'?'J1':'J2') + (state.mp.active===state.mp.role?' (à toi)':' (attends)') : 'Solo';
  el.roomInfo.textContent = state.mp.online ? `Salle ${state.mp.room} • ${state.mp.role.toUpperCase()} • Tour: ${state.mp.active.toUpperCase()}` : 'Hors ligne (solo)';
  el.buyP.disabled = !(me.gold >= 1 && me.peasants < me.farmCap && (!state.mp.online || state.mp.active===state.mp.role));
  el.buyF.disabled = !(me.gold >= 10 && (!state.mp.online || state.mp.active===state.mp.role));
  el.step.disabled = !!(state.mp.online && state.mp.active!==state.mp.role);
  renderBoard();
  renderFarms();
}
function log(role, msg){
  const tag = role.toUpperCase();
  const t = new Date().toLocaleTimeString();
  el.log.textContent = `[${t}] ${tag} · ${msg}\n` + el.log.textContent;
}

// ======= Local save for solo =========
function saveLocal(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }catch(e){} }
function loadLocal(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const s = JSON.parse(raw);
    // keep mp offline in solo load
    const mpKeep = state.mp;
    Object.assign(state, s);
    state.mp = mpKeep;
    if(!state.board || state.board.length!==state.n){ state.board = newBoard(state.n); }
    if(!state.hp || state.hp.length!==state.n){ state.hp = newHP(state.n, state.defP, state.defE); }
    return true;
  }catch(e){ return false; }
}

// ======= Multiplayer plumbing (Firebase) =======
function roomRef(){ return ref(db, 'rooms/' + state.mp.room); }

function randomRoom(){
  return String(Math.floor(1000 + Math.random()*9000));
}

async function createRoom(){
  const code = randomRoom();
  state.mp.online = true;
  state.mp.role = 'p1';
  state.mp.room = code;
  state.mp.active = 'p1';
  // fresh state
  state.n = 10;
  state.board = newBoard(state.n);
  state.hp = newHP(state.n, state.defP, state.defE);
  state.turn = 0;
  state.p1 = { gold:1, peasants:0, footmen:0, farmCap:30 };
  state.p2 = { gold:1, peasants:0, footmen:0, farmCap:30 };
  await set(roomRef(), { state });
  render();
  log('p1', 'Salle créée. Partage le code: ' + code);
}

async function joinRoom(code){
  const snap = await get(child(ref(db), 'rooms/' + code));
  if(!snap.exists()){ alert('Salle introuvable'); return; }
  state.mp.online = true;
  state.mp.role = 'p2';
  state.mp.room = code;
  const remote = snap.val().state;
  Object.assign(state, remote);
  state.mp.role = 'p2';
  // Write back presence (optional small flag)
  await update(roomRef(), { joined:true });
  render();
  log('p2', 'Rejoint la salle ' + code);
}

// Live sync
onValue(ref(db, 'rooms'), (snapshot)=>{
  if(!state.mp.online || !state.mp.room) return;
  const data = snapshot.val();
  if(!data) return;
  const room = data[state.mp.room];
  if(!room || !room.state) return;
  const beforeRole = state.mp.role;
  const mpKeep = state.mp;
  Object.assign(state, room.state);
  state.mp = mpKeep; // keep local identity
  render();
});

async function pushRoomState(){
  if(!state.mp.online) return;
  await update(roomRef(), { state });
}

// ======= Events =======
document.getElementById('buyPeasant').addEventListener('click', ()=>{ if(buyPeasant(myRole())){ state.mp.online?pushRoomState():(render(),saveLocal()); } });
document.getElementById('buyFootman').addEventListener('click', ()=>{ if(buyFootman(myRole())){ state.mp.online?pushRoomState():(render(),saveLocal()); } });
document.getElementById('stepBtn').addEventListener('click', endTurn);
document.getElementById('resetBtn').addEventListener('click', ()=>{
  if(state.mp.online){
    // reset room state (only active player allowed)
    if(state.mp.role!=='p1'){ alert('Seul J1 peut reset'); return; }
    state.board = newBoard(state.n);
    state.hp = newHP(state.n, state.defP, state.defE);
    state.turn = 0;
    state.p1 = { gold:1, peasants:0, footmen:0, farmCap:30 };
    state.p2 = { gold:1, peasants:0, footmen:0, farmCap:30 };
    state.mp.active = 'p1';
    pushRoomState();
  }else{
    // solo reset
    state.board = newBoard(state.n);
    state.hp = newHP(state.n, state.defP, state.defE);
    state.turn = 0;
    state.p1 = { gold:1, peasants:0, footmen:0, farmCap:30 };
    state.p2 = { gold:1, peasants:0, footmen:0, farmCap:30 };
    render(); saveLocal();
  }
});
document.getElementById('resizeBtn').addEventListener('click', ()=>{
  let n = parseInt(document.getElementById('sizeInput').value||'10',10);
  n = Math.max(7, Math.min(25, n));
  state.n = n;
  state.board = newBoard(n);
  state.hp = newHP(n, state.defP, state.defE);
  state.turn = 0;
  if(state.mp.online) pushRoomState(); else { render(); saveLocal(); }
});
document.getElementById('victoryMode').addEventListener('change', (e)=>{
  state.victoryMode = e.target.value;
  state.mp.online?pushRoomState():(render(),saveLocal());
});

document.getElementById('createBtn').addEventListener('click', createRoom);
document.getElementById('joinBtn').addEventListener('click', ()=>{
  const code = (document.getElementById('roomInput').value||'').trim();
  if(!/^[0-9]{4}$/.test(code)){ alert('Code = 4 chiffres'); return; }
  joinRoom(code);
});

// ======= Init =======
(function init(){
  if(!loadLocal()){
    state.board = newBoard(state.n);
    state.hp = newHP(state.n, state.defP, state.defE);
  }
  document.getElementById('sizeInput').value = state.n;
  render();
  if(state.turn===0){
    log('p1', 'Solo prêt. Ou clique CRÉER pour générer un code 4 chiffres.');
  }
})();
