// Versus Online (Firebase Realtime Database)
const CELL = { NEUTRAL:0, PLAYER:1, ENEMY:2 };
const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];
const DEF_OPTS = { size:10, pNeutral:0.65, pEnemy:0.40, farmCap:30 };
const OPTS_KEY = 'inc_spa_opts_v1';

function loadOpts(){ try{ return Object.assign({}, DEF_OPTS, JSON.parse(localStorage.getItem(OPTS_KEY)||'{}')); }catch(e){ return {...DEF_OPTS}; } }
function inb(n,x,y){ return x>=0 && x<n && y>=0 && y<n; }
function neighbors(n,x,y){ const out=[]; for(const [dx,dy] of DIRS){ const nx=x+dx,ny=y+dy; if(inb(n,nx,ny)) out.push([nx,ny]); } return out; }
function neutralHPFor(n,i,j){ const midCol=Math.floor(n/2); const d=Math.abs(j-midCol)/Math.max(1,midCol); const MIN=4, MAX=10; return Math.round(MIN+(MAX-MIN)*(1-d)); }
function newBoard(n){ const B=Array.from({length:n}, _=>Array(n).fill(CELL.NEUTRAL)); const mid=Math.floor(n/2); B[mid][0]=CELL.ENEMY; B[mid][n-1]=CELL.PLAYER; return B; }
function newHP(n){ const H=Array.from({length:n}, _=>Array(n).fill(1)); for(let i=0;i<n;i++) for(let j=0;j<n;j++) H[i][j]=neutralHPFor(n,i,j); H[Math.floor(n/2)][0]=3; H[Math.floor(n/2)][n-1]=3; return H; }

const el = {
  board: document.getElementById('v-board'),
  grid: document.getElementById('v-grid'),
  gold: document.getElementById('v-gold'),
  income: document.getElementById('v-income'),
  turn: document.getElementById('v-turn'),
  role: document.getElementById('v-role'),
  buyP: document.getElementById('v-buyP'),
  buyF: document.getElementById('v-buyF'),
  pCount: document.getElementById('v-pCount'),
  fCount: document.getElementById('v-fCount'),
  farms: document.getElementById('v-farms'),
  farmCap: document.getElementById('v-farmCap'),
  step: document.getElementById('v-step'),
  reset: document.getElementById('v-reset'),
  log: document.getElementById('v-log'),
  vCreate: document.getElementById('v-create'),
  vJoin: document.getElementById('v-join'),
  vRoom: document.getElementById('v-room'),
  roomInfo: document.getElementById('v-roomInfo'),
  fbWarn: document.getElementById('v-fbWarn'),
};

// Load Firebase if config present
let firebaseReady = false, db=null, fb=null, rtdb=null;
(async ()=>{
  try{
    const { firebaseConfig } = await import('./firebase-config.js');
    fb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    rtdb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
    const app = fb.initializeApp(firebaseConfig);
    db = rtdb.getDatabase(app);
    firebaseReady = true;
    el.fbWarn.style.display='none';
  }catch(e){
    el.fbWarn.style.display='block';
  }
})();

const opts = loadOpts();
const S = {
  n: opts.size, board: newBoard(opts.size), hp: newHP(opts.size), turn:0,
  p1: { gold:1, peasants:0, footmen:0, farmCap:opts.farmCap },
  p2: { gold:1, peasants:0, footmen:0, farmCap:opts.farmCap },
  pNeutral: opts.pNeutral, pEnemy: opts.pEnemy, defP:1, defE:2,
  mp: { online:false, role:null, room:null, active:'p1' }
};

function income(p){ return p.peasants; }
function frontierFor(who){
  const n=S.n, seen=new Set(), out=[];
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){
    if(S.board[i][j]!==who) continue;
    for(const [nx,ny] of neighbors(n,i,j)){
      if(S.board[nx][ny]!==who){
        const k=nx+','+ny;
        if(!seen.has(k)){ seen.add(k); out.push([nx,ny]); }
      }
    }
  }
  return out;
}
function capture(role){
  const me = role==='p1'?S.p1:S.p2;
  const who = role==='p1'?CELL.PLAYER:CELL.ENEMY;
  const attempts = me.footmen;
  if(attempts<=0) return 0;
  const front = frontierFor(who);
  if(front.length===0) return 0;
  let caps=0;
  for(let k=0;k<attempts;k++){
    const [x,y] = front[Math.floor(Math.random()*front.length)];
    const target = S.board[x][y];
    const p = (target===CELL.NEUTRAL)?S.pNeutral:S.pEnemy;
    if(Math.random()<p){
      S.hp[x][y] = Math.max(0, (S.hp[x][y]||1)-1);
      if(S.hp[x][y]===0){
        S.board[x][y] = who;
        S.hp[x][y] = (role==='p1'?S.defP:S.defE);
        caps++;
      }
    }
  }
  return caps;
}
function renderBoard(){
  el.board.style.gridTemplateColumns = `repeat(${S.n}, var(--tile))`;
  el.board.innerHTML='';
  const pc=[Math.floor(S.n/2), S.n-1], ec=[Math.floor(S.n/2), 0];
  for(let i=0;i<S.n;i++){
    for(let j=0;j<S.n;j++){
      const v = S.board[i][j];
      const d = document.createElement('div');
      d.className='cell '+(v===CELL.NEUTRAL?'neutral':v===CELL.PLAYER?'player':'enemy');
      const isPC=(i===pc[0]&&j===pc[1]); const isEC=(i===ec[0]&&j===ec[1]);
      d.textContent=(v===CELL.NEUTRAL)?'🏳':(v===CELL.PLAYER?(isPC?'🏰':'🟩'):(isEC?'🏯':'🟥'));
      d.title=`PV: ${S.hp[i]?.[j] ?? 1}`;
      el.board.appendChild(d);
    }
  }
}
function render(){
  const role = S.mp.role || 'p1';
  const me = role==='p1'?S.p1:S.p2;
  el.grid.textContent=`${S.n}×${S.n}`;
  el.turn.textContent=`Tour: ${S.turn}`;
  el.gold.textContent=`Or: ${me.gold}`;
  el.income.textContent=`Revenu/tour: ${income(me)}`;
  el.pCount.textContent=`${me.peasants} paysan${me.peasants>1?'s':''}`;
  el.fCount.textContent=`${me.footmen} fantassin${me.footmen>1?'s':''}`;
  el.role.textContent = S.mp.online ? (S.mp.role==='p1'?'J1':'J2') + (S.mp.active===S.mp.role?' (à toi)':' (attends)') : 'Solo';
  el.buyP.disabled = !(me.gold>=1 && me.peasants<me.farmCap && (!S.mp.online || S.mp.active===S.mp.role));
  el.buyF.disabled = !(me.gold>=10 && (!S.mp.online || S.mp.active===S.mp.role));
  el.step.disabled = !!(S.mp.online && S.mp.active!==S.mp.role);
  el.roomInfo.textContent = S.mp.online ? `Salle ${S.mp.room} • ${S.mp.role.toUpperCase()} • Tour: ${S.mp.active.toUpperCase()}` : 'Hors ligne';
  renderBoard();
}
function log(msg){ const t=new Date().toLocaleTimeString(); el.log.textContent=`[${t}] ${msg}
`+el.log.textContent; }

// Firebase helpers
function roomRef(){ return rtdb.ref(db, 'rooms/'+S.mp.room); }
function randomRoom(){ return String(Math.floor(1000+Math.random()*9000)); }
async function createRoom(){
  if(!firebaseReady){ alert('Ajoute firebase-config.js à la racine.'); return; }
  S.mp.online=true; S.mp.role='p1'; S.mp.room=randomRoom(); S.mp.active='p1';
  Object.assign(S, { n: loadOpts().size, board: newBoard(loadOpts().size), hp: newHP(loadOpts().size), turn:0,
    p1:{gold:1,peasants:0,footmen:0,farmCap:loadOpts().farmCap},
    p2:{gold:1,peasants:0,footmen:0,farmCap:loadOpts().farmCap},
    pNeutral:loadOpts().pNeutral, pEnemy:loadOpts().pEnemy, defP:1, defE:2, mp:S.mp });
  await rtdb.set(roomRef(), { state: S });
  render(); log('Salle créée. Code: '+S.mp.room);
}
async function joinRoom(code){
  if(!firebaseReady){ alert('Ajoute firebase-config.js à la racine.'); return; }
  const snap = await rtdb.get(rtdb.child(rtdb.ref(db), 'rooms/'+code));
  if(!snap.exists()){ alert('Salle introuvable'); return; }
  S.mp.online=true; S.mp.role='p2'; S.mp.room=code;
  const remote = snap.val().state; Object.assign(S, remote); S.mp.role='p2';
  render(); log('Rejoint la salle '+code);
}
function push(){ if(firebaseReady && S.mp.online) rtdb.update(roomRef(), { state: S }); }

if(typeof window !== 'undefined'){
  // live sync
  setTimeout(()=>{
    if(firebaseReady){
      rtdb.onValue(rtdb.ref(db, 'rooms'), (snap)=>{
        if(!S.mp.online || !S.mp.room) return;
        const data = snap.val(); if(!data) return;
        const room = data[S.mp.room]; if(!room || !room.state) return;
        const prev = S.mp;
        Object.assign(S, room.state);
        S.mp = prev; // keep local role/active flags
        render();
      });
    }
  }, 800);
}

// events
el.vCreate.addEventListener('click', createRoom);
el.vJoin.addEventListener('click', ()=>{
  const code=(el.vRoom.value||'').trim(); if(!/^[0-9]{4}$/.test(code)){ alert('Code = 4 chiffres'); return; }
  joinRoom(code);
});
el.buyP.addEventListener('click', ()=>{ const me=S.mp.role||'p1'; const P=me==='p1'?S.p1:S.p2;
  if(P.gold>=1 && P.peasants<P.farmCap){ P.gold-=1; P.peasants++; S.mp.online?push():render(); }
});
el.buyF.addEventListener('click', ()=>{ const me=S.mp.role||'p1'; const P=me==='p1'?S.p1:S.p2;
  if(P.gold>=10){ P.gold-=10; P.footmen++; S.mp.online?push():render(); }
});
el.step.addEventListener('click', ()=>{
  const me=S.mp.role||'p1'; const P=me==='p1'?S.p1:S.p2;
  S.turn++; P.gold += P.peasants; const caps = (function(role){ const who=role==='p1'?CELL.PLAYER:CELL.ENEMY; const attempts=(role==='p1'?S.p1:S.p2).footmen;
    let c=0; if(attempts<=0) return 0; const front=(function(){ const n=S.n, seen=new Set(), out=[];
    for(let i=0;i<n;i++) for(let j=0;j<n;j++){ if(S.board[i][j]!==who) continue; for(const [nx,ny] of DIRS){ const x=i+nx,y=j+ny; if(inb(n,x,y)&&S.board[x][y]!==who){ const k=x+','+y; if(!seen.has(k)){seen.add(k); out.push([x,y]);}}}} return out; })();
    for(let k=0;k<attempts;k++){ const t=front[Math.floor(Math.random()*front.length)]; if(!t) break; const [x,y]=t; const targ=S.board[x][y]; const p=(targ===CELL.NEUTRAL)?S.pNeutral:S.pEnemy;
      if(Math.random()<p){ S.hp[x][y]=Math.max(0,(S.hp[x][y]||1)-1); if(S.hp[x][y]===0){ S.board[x][y]=who; S.hp[x][y]=(role==='p1'?S.defP:S.defE); c++; }}} return c; })(me);
  S.mp.active = S.mp.online ? (S.mp.active==='p1'?'p2':'p1') : 'p1';
  S.mp.online?push():render();
});
el.reset.addEventListener('click', ()=>{
  Object.assign(S, { n: opts.size, board: newBoard(opts.size), hp: newHP(opts.size), turn:0,
    p1:{gold:1,peasants:0,footmen:0,farmCap:opts.farmCap},
    p2:{gold:1,peasants:0,footmen:0,farmCap:opts.farmCap},
    pNeutral:opts.pNeutral, pEnemy:opts.pEnemy, defP:1, defE:2, mp:{online:false,role:null,room:null,active:'p1'} });
  render();
});

render();
