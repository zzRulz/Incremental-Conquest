// Single-Page App with Solo, Versus (Firebase), Settings
// If firebase-config.js is missing, Versus view shows a warning and stays offline.

// ---- Utilities for views ----
const qs = (s, el=document)=>el.querySelector(s);
const qsa = (s, el=document)=>[...el.querySelectorAll(s)];
function show(view){
  qsa('.view').forEach(v=>v.classList.remove('active'));
  qs('#view-'+view).classList.add('active');
  window.location.hash = view;
}
qsa('button[data-view]').forEach(b=>b.addEventListener('click', ()=> show(b.dataset.view)));
window.addEventListener('hashchange', ()=>{
  const v = (location.hash||'#menu').slice(1);
  if(qs('#view-'+v)) show(v);
});
show((location.hash||'#menu').slice(1));

// ---- Shared game model helpers ----
const CELL = { NEUTRAL:0, PLAYER:1, ENEMY:2 };
const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];
const DEF_OPTS = { size:10, pNeutral:0.65, pEnemy:0.40, farmCap:30 };
const OPTS_KEY = 'inc_spa_opts_v1';

function loadOpts(){
  try{ return Object.assign({}, DEF_OPTS, JSON.parse(localStorage.getItem(OPTS_KEY)||'{}')); }catch(e){ return {...DEF_OPTS}; }
}
function saveOpts(o){ localStorage.setItem(OPTS_KEY, JSON.stringify(o)); }

function neutralHPFor(n, i, j){
  const midCol = Math.floor(n/2);
  const d = Math.abs(j - midCol) / Math.max(1, midCol);
  const MIN_EDGE_HP=4, MAX_CENTER_HP=10;
  return Math.round(MIN_EDGE_HP + (MAX_CENTER_HP - MIN_EDGE_HP) * (1 - d));
}
function inb(n,x,y){ return x>=0 && x<n && y>=0 && y<n; }
function neighbors(n,x,y){
  const out=[]; for(const [dx,dy] of DIRS){ const nx=x+dx,ny=y+dy; if(inb(n,nx,ny)) out.push([nx,ny]); } return out;
}
function newBoard(n){
  const B = Array.from({length:n}, _ => Array(n).fill(CELL.NEUTRAL));
  const mid = Math.floor(n/2);
  // gauche = p2, droite = p1
  B[mid][0] = CELL.ENEMY;
  B[mid][n-1] = CELL.PLAYER;
  return B;
}
function newHP(n){
  const H = Array.from({length:n}, _ => Array(n).fill(1));
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) H[i][j] = neutralHPFor(n,i,j);
  // castles tanky
  H[Math.floor(n/2)][0]   = 3; // enemy
  H[Math.floor(n/2)][n-1] = 3; // player
  return H;
}

// ================= SOLO =================
(function solo(){
  const el = {
    board: qs('#s-board'),
    grid: qs('#s-grid'),
    gold: qs('#s-gold'),
    income: qs('#s-income'),
    turn: qs('#s-turn'),
    role: qs('#s-role'),
    buyP: qs('#s-buyP'),
    buyF: qs('#s-buyF'),
    pCount: qs('#s-pCount'),
    fCount: qs('#s-fCount'),
    farms: qs('#s-farms'),
    farmCap: qs('#s-farmCap'),
    step: qs('#s-step'),
    reset: qs('#s-reset'),
    log: qs('#s-log'),
    pN: qs('#s-pN'),
    pE: qs('#s-pE'),
  };

  const opts = loadOpts();
  const S = {
    n: opts.size, board: newBoard(opts.size), hp: newHP(opts.size),
    turn: 0,
    p1: { gold:1, peasants:0, footmen:0, farmCap:opts.farmCap },
    p2: { gold:1, peasants:0, footmen:0, farmCap:opts.farmCap },
    pNeutral: opts.pNeutral, pEnemy: opts.pEnemy,
    defP:1, defE:2
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

  function log(msg){ const t=new Date().toLocaleTimeString(); el.log.textContent = `[${t}] ${msg}
` + el.log.textContent; }

  function renderBoard(){
    el.board.style.gridTemplateColumns = `repeat(${S.n}, var(--tile))`;
    el.board.innerHTML='';
    const pc=[Math.floor(S.n/2), S.n-1], ec=[Math.floor(S.n/2), 0];
    for(let i=0;i<S.n;i++){
      for(let j=0;j<S.n;j++){
        const v = S.board[i][j];
        const d = document.createElement('div');
        d.className = 'cell ' + (v===CELL.NEUTRAL?'neutral':v===CELL.PLAYER?'player':'enemy');
        const isPC = (i===pc[0] && j===pc[1]);
        const isEC = (i===ec[0] && j===ec[1]);
        d.textContent = (v===CELL.NEUTRAL)?'🏳':(v===CELL.PLAYER?(isPC?'🏰':'🟩'):(isEC?'🏯':'🟥'));
        d.title = `PV: ${S.hp[i]?.[j] ?? 1}`;
        el.board.appendChild(d);
      }
    }
  }
  function renderFarms(role){
    const p = role==='p1'?S.p1:S.p2;
    el.farmCap.textContent = p.farmCap;
    el.farms.innerHTML='';
    for(let i=0;i<p.farmCap;i++){
      const f=document.createElement('div');
      f.className = 'farm' + (i<p.peasants?' filled':'');
      f.textContent = (i<p.peasants)?'🌾':'▢';
      el.farms.appendChild(f);
    }
  }
  function render(){
    el.grid.textContent = `${S.n}×${S.n}`;
    el.pN.textContent = Math.round(S.pNeutral*100)+'%';
    el.pE.textContent = Math.round(S.pEnemy*100)+'%';
    el.turn.textContent = `Tour: ${S.turn}`;
    el.gold.textContent = `Or: ${S.p1.gold}`;
    el.income.textContent = `Revenu/tour: ${income(S.p1)}`;
    el.pCount.textContent = `${S.p1.peasants} paysan${S.p1.peasants>1?'s':''}`;
    el.fCount.textContent = `${S.p1.footmen} fantassin${S.p1.footmen>1?'s':''}`;
    renderBoard(); renderFarms('p1');
    el.buyP.disabled = !(S.p1.gold>=1 && S.p1.peasants < S.p1.farmCap);
    el.buyF.disabled = !(S.p1.gold>=10);
  }

  function aiTurn(){
    // IA très simple : si < 10 paysans et or>=1, achète paysan, sinon fantassin si or>=10
    if(S.p2.gold>=1 && S.p2.peasants<10){ S.p2.gold-=1; S.p2.peasants+=1; log('IA achète 1 paysan.'); }
    else if(S.p2.gold>=10){ S.p2.gold-=10; S.p2.footmen+=1; log('IA recrute 1 fantassin.'); }
    // Prod
    S.p2.gold += income(S.p2);
    // Capture
    const caps = capture('p2');
    if(caps>0) log(`IA captures: ${caps}`);
  }

  // actions
  el.buyP.addEventListener('click', ()=>{ if(S.p1.gold>=1 && S.p1.peasants<S.p1.farmCap){ S.p1.gold-=1; S.p1.peasants++; render(); log('👨‍🌾 +1 paysan.'); } });
  el.buyF.addEventListener('click', ()=>{ if(S.p1.gold>=10){ S.p1.gold-=10; S.p1.footmen++; render(); log('🛡️ +1 fantassin.'); } });
  el.step.addEventListener('click', ()=>{
    S.turn++;
    // prod joueur
    S.p1.gold += income(S.p1);
    // capture joueur
    const c1 = capture('p1');
    // tour IA
    aiTurn();
    log(`Tour ${S.turn}: toi +${income(S.p1)} or, captures ${c1}`);
    render();
  });
  el.reset.addEventListener('click', ()=>{
    Object.assign(S, {
      n: opts.size, board: newBoard(opts.size), hp: newHP(opts.size), turn:0,
      p1: { gold:1, peasants:0, footmen:0, farmCap:opts.farmCap },
      p2: { gold:1, peasants:0, footmen:0, farmCap:opts.farmCap },
      pNeutral: opts.pNeutral, pEnemy: opts.pEnemy, defP:1, defE:2
    });
    el.log.textContent='—'; render();
  });

  // init
  el.log.textContent = "Bienvenue en solo ! Achète 1 paysan (1 or), puis fin de tour.";
  render();
})();

// ================= SETTINGS =================
(function settings(){
  const el = {
    size: qs('#opt-size'),
    pN: qs('#opt-pN'),
    pE: qs('#opt-pE'),
    farmCap: qs('#opt-farmCap'),
    save: qs('#opt-save'),
    reset: qs('#opt-reset'),
  };
  function loadForm(){
    const o = loadOpts();
    el.size.value = o.size;
    el.pN.value = o.pNeutral;
    el.pE.value = o.pEnemy;
    el.farmCap.value = o.farmCap;
  }
  el.save.addEventListener('click', ()=>{
    const o = {
      size: Math.max(7, Math.min(25, parseInt(el.size.value||'10',10))),
      pNeutral: Math.max(0.3, Math.min(0.95, parseFloat(el.pN.value||'0.65'))),
      pEnemy: Math.max(0.2, Math.min(0.9, parseFloat(el.pE.value||'0.40'))),
      farmCap: Math.max(6, Math.min(60, parseInt(el.farmCap.value||'30',10))),
    };
    saveOpts(o);
    alert('Paramètres enregistrés. Ils s’appliqueront aux nouvelles parties.');
  });
  el.reset.addEventListener('click', ()=>{ saveOpts(DEF_OPTS); loadForm(); });
  loadForm();
})();

// ================= VERSUS (Firebase) =================
(async function versus(){
  const el = {
    board: qs('#v-board'),
    grid: qs('#v-grid'),
    gold: qs('#v-gold'),
    income: qs('#v-income'),
    turn: qs('#v-turn'),
    role: qs('#v-role'),
    buyP: qs('#v-buyP'),
    buyF: qs('#v-buyF'),
    pCount: qs('#v-pCount'),
    fCount: qs('#v-fCount'),
    farms: qs('#v-farms'),
    farmCap: qs('#v-farmCap'),
    step: qs('#v-step'),
    reset: qs('#v-reset'),
    log: qs('#v-log'),
    vCreate: qs('#v-create'),
    vJoin: qs('#v-join'),
    vRoom: qs('#v-room'),
    roomInfo: qs('#v-roomInfo'),
    fbWarn: qs('#v-fbWarn'),
  };

  // Try to import firebase config dynamically; if missing, stay offline
  let firebaseReady = false, firebase=null, db=null, firebaseConfig=null;
  try{
    firebaseConfig = (await import('./firebase-config.js')).firebaseConfig;
    firebase = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const rtdb = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js');
    const app = firebase.initializeApp(firebaseConfig);
    db = rtdb.getDatabase(app);
    firebaseReady = true;
    el.fbWarn.style.display='none';
  }catch(e){
    el.fbWarn.style.display='block';
  }

  const opts = loadOpts();
  const S = {
    n: opts.size, board: newBoard(opts.size), hp: newHP(opts.size), turn:0,
    p1: { gold:1, peasants:0, footmen:0, farmCap:opts.farmCap },
    p2: { gold:1, peasants:0, footmen:0, farmCap:opts.farmCap },
    pNeutral: opts.pNeutral, pEnemy: opts.pEnemy,
    defP:1, defE:2,
    mp: { online:false, role:null, room:null, active:'p1' }
  };

  const { ref, onValue, set, update, get, child } = firebaseReady ? await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js') : {ref:null,onValue:null,set:null,update:null,get:null,child:null};

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
        d.className = 'cell ' + (v===CELL.NEUTRAL?'neutral':v===CELL.PLAYER?'player':'enemy');
        const isPC = (i===pc[0] && j===pc[1]);
        const isEC = (i===ec[0] && j===ec[1]);
        d.textContent = (v===CELL.NEUTRAL)?'🏳':(v===CELL.PLAYER?(isPC?'🏰':'🟩'):(isEC?'🏯':'🟥'));
        d.title = `PV: ${S.hp[i]?.[j] ?? 1}`;
        el.board.appendChild(d);
      }
    }
  }
  function render(){
    const role = S.mp.role || 'p1';
    const me = role==='p1'?S.p1:S.p2;
    el.grid.textContent = `${S.n}×${S.n}`;
    el.turn.textContent = `Tour: ${S.turn}`;
    el.gold.textContent = `Or: ${me.gold}`;
    el.income.textContent = `Revenu/tour: ${income(me)}`;
    el.pCount.textContent = `${me.peasants} paysan${me.peasants>1?'s':''}`;
    el.fCount.textContent = `${me.footmen} fantassin${me.footmen>1?'s':''}`;
    el.role.textContent = S.mp.online ? (S.mp.role==='p1'?'J1':'J2') + (S.mp.active===S.mp.role?' (à toi)':' (attends)') : 'Solo';
    el.buyP.disabled = !(me.gold>=1 && me.peasants<me.farmCap && (!S.mp.online || S.mp.active===S.mp.role));
    el.buyF.disabled = !(me.gold>=10 && (!S.mp.online || S.mp.active===S.mp.role));
    el.step.disabled = !!(S.mp.online && S.mp.active!==S.mp.role);
    el.roomInfo.textContent = S.mp.online ? `Salle ${S.mp.room} • ${S.mp.role.toUpperCase()} • Tour: ${S.mp.active.toUpperCase()}` : 'Hors ligne';
    renderBoard();
  }
  function log(msg){ const t=new Date().toLocaleTimeString(); el.log.textContent = `[${t}] ${msg}
` + el.log.textContent; }
  function roomRef(){ return ref(db, 'rooms/' + S.mp.room); }
  function randomRoom(){ return String(Math.floor(1000 + Math.random()*9000)); }

  async function createRoom(){
    if(!firebaseReady){ alert('Ajoute firebase-config.js pour jouer en ligne.'); return; }
    S.mp.online = true; S.mp.role='p1'; S.mp.room=randomRoom(); S.mp.active='p1';
    // reset shared state
    Object.assign(S, {
      n: loadOpts().size, board: newBoard(loadOpts().size), hp: newHP(loadOpts().size), turn:0,
      p1: { gold:1, peasants:0, footmen:0, farmCap:loadOpts().farmCap },
      p2: { gold:1, peasants:0, footmen:0, farmCap:loadOpts().farmCap },
      pNeutral: loadOpts().pNeutral, pEnemy: loadOpts().pEnemy,
      defP:1, defE:2, mp: S.mp
    });
    await set(roomRef(), { state: S });
    render(); log('Salle créée. Partage le code: '+S.mp.room);
  }
  async function joinRoom(code){
    if(!firebaseReady){ alert('Ajoute firebase-config.js pour jouer en ligne.'); return; }
    const snap = await get(child(ref(db), 'rooms/' + code));
    if(!snap.exists()){ alert('Salle introuvable'); return; }
    S.mp.online=true; S.mp.role='p2'; S.mp.room=code;
    const remote = snap.val().state;
    Object.assign(S, remote); S.mp.role='p2';
    render(); log('Rejoint la salle '+code);
  }
  function push(){ if(firebaseReady && S.mp.online) update(roomRef(), { state: S }); }

  if(firebaseReady){
    onValue(ref(db, 'rooms'), (snap)=>{
      if(!S.mp.online || !S.mp.room) return;
      const data = snap.val(); if(!data) return; const room=data[S.mp.room]; if(!room||!room.state) return;
      const myRole = S.mp.role;
      const prevMp = S.mp;
      Object.assign(S, room.state);
      S.mp = prevMp; S.mp.role = myRole;
      render();
    });
  }

  // actions
  el.vCreate.addEventListener('click', createRoom);
  el.vJoin.addEventListener('click', ()=>{
    const code = (el.vRoom.value||'').trim();
    if(!/^[0-9]{4}$/.test(code)){ alert('Code = 4 chiffres'); return; }
    joinRoom(code);
  });
  el.buyP.addEventListener('click', ()=>{
    const me = S.mp.role||'p1'; const P = me==='p1'?S.p1:S.p2;
    if(P.gold>=1 && P.peasants<P.farmCap){ P.gold-=1; P.peasants++; S.mp.online?push():render(); }
  });
  el.buyF.addEventListener('click', ()=>{
    const me = S.mp.role||'p1'; const P = me==='p1'?S.p1:S.p2;
    if(P.gold>=10){ P.gold-=10; P.footmen++; S.mp.online?push():render(); }
  });
  el.step.addEventListener('click', ()=>{
    const me = S.mp.role||'p1'; const P = me==='p1'?S.p1:S.p2;
    S.turn++; P.gold += P.peasants; const caps = (function(role){ return (function(){ const who=role==='p1'?CELL.PLAYER:CELL.ENEMY;
      const attempts = (role==='p1'?S.p1:S.p2).footmen; let c=0; if(attempts<=0) return 0;
      const front=(function(){ const n=S.n, seen=new Set(), out=[];
        for(let i=0;i<n;i++) for(let j=0;j<n;j++){ if(S.board[i][j]!==who) continue;
          for(const [nx,ny] of neighbors(n,i,j)){ if(S.board[nx][ny]!==who){ const k=nx+','+ny; if(!seen.has(k)){seen.add(k); out.push([nx,ny]);}}}} return out; })();
      for(let k=0;k<attempts;k++){ const [x,y]=front[Math.floor(Math.random()*front.length)]||[]; if(x==null) break;
        const target=S.board[x][y]; const p=(target===CELL.NEUTRAL)?S.pNeutral:S.pEnemy;
        if(Math.random()<p){ S.hp[x][y]=Math.max(0,(S.hp[x][y]||1)-1); if(S.hp[x][y]===0){ S.board[x][y]=who; S.hp[x][y]=(role==='p1'?S.defP:S.defE); c++; }}} return c; })(); })(me);
    S.mp.active = S.mp.online ? (S.mp.active==='p1'?'p2':'p1') : 'p1';
    S.mp.online?push():render();
  });
  el.reset.addEventListener('click', ()=>{
    Object.assign(S, {
      n: opts.size, board: newBoard(opts.size), hp: newHP(opts.size), turn:0,
      p1: { gold:1, peasants:0, footmen:0, farmCap:opts.farmCap },
      p2: { gold:1, peasants:0, footmen:0, farmCap:opts.farmCap },
      pNeutral: opts.pNeutral, pEnemy: opts.pEnemy, defP:1, defE:2,
      mp: { online:false, role:null, room:null, active:'p1' }
    });
    render();
  });

  render();
})();
