// Solo mode: incremental vs simple AI
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
  board: document.getElementById('s-board'),
  grid: document.getElementById('s-grid'),
  gold: document.getElementById('s-gold'),
  income: document.getElementById('s-income'),
  turn: document.getElementById('s-turn'),
  role: document.getElementById('s-role'),
  buyP: document.getElementById('s-buyP'),
  buyF: document.getElementById('s-buyF'),
  pCount: document.getElementById('s-pCount'),
  fCount: document.getElementById('s-fCount'),
  farms: document.getElementById('s-farms'),
  farmCap: document.getElementById('s-farmCap'),
  step: document.getElementById('s-step'),
  reset: document.getElementById('s-reset'),
  log: document.getElementById('s-log'),
  pN: document.getElementById('s-pN'),
  pE: document.getElementById('s-pE'),
};

const opts = loadOpts();
const S = {
  n: opts.size, board: newBoard(opts.size), hp: newHP(opts.size),
  turn: 0,
  p1: { gold:1, peasants:0, footmen:0, farmCap:opts.farmCap },
  p2: { gold:1, peasants:0, footmen:0, farmCap:opts.farmCap },
  pNeutral: opts.pNeutral, pEnemy: opts.pEnemy, defP:1, defE:2
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
function log(msg){ const t=new Date().toLocaleTimeString(); el.log.textContent=`[${t}] ${msg}
`+el.log.textContent; }

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
    f.className='farm'+(i<p.peasants?' filled':'');
    f.textContent=(i<p.peasants)?'🌾':'▢';
    el.farms.appendChild(f);
  }
}
function render(){
  el.grid.textContent=`${S.n}×${S.n}`;
  el.pN.textContent=Math.round(S.pNeutral*100)+'%';
  el.pE.textContent=Math.round(S.pEnemy*100)+'%';
  el.turn.textContent=`Tour: ${S.turn}`;
  el.gold.textContent=`Or: ${S.p1.gold}`;
  el.income.textContent=`Revenu/tour: ${income(S.p1)}`;
  el.pCount.textContent=`${S.p1.peasants} paysan${S.p1.peasants>1?'s':''}`;
  el.fCount.textContent=`${S.p1.footmen} fantassin${S.p1.footmen>1?'s':''}`;
  renderBoard(); renderFarms('p1');
  el.buyP.disabled = !(S.p1.gold>=1 && S.p1.peasants<S.p1.farmCap);
  el.buyF.disabled = !(S.p1.gold>=10);
}

function aiTurn(){
  if(S.p2.gold>=1 && S.p2.peasants<10){ S.p2.gold-=1; S.p2.peasants+=1; log('IA achète 1 paysan.'); }
  else if(S.p2.gold>=10){ S.p2.gold-=10; S.p2.footmen+=1; log('IA recrute 1 fantassin.'); }
  S.p2.gold += income(S.p2);
  const caps = capture('p2'); if(caps>0) log(`IA captures: ${caps}`);
}

// events
el.buyP.addEventListener('click', ()=>{ if(S.p1.gold>=1 && S.p1.peasants<S.p1.farmCap){ S.p1.gold-=1; S.p1.peasants++; render(); log('👨‍🌾 +1 paysan.'); } });
el.buyF.addEventListener('click', ()=>{ if(S.p1.gold>=10){ S.p1.gold-=10; S.p1.footmen++; render(); log('🛡️ +1 fantassin.'); } });
el.step.addEventListener('click', ()=>{
  S.turn++; S.p1.gold += income(S.p1); const c1 = capture('p1'); aiTurn();
  log(`Tour ${S.turn}: toi +${income(S.p1)} or, captures ${c1}`); render();
});
el.reset.addEventListener('click', ()=>{
  Object.assign(S, { n: opts.size, board: newBoard(opts.size), hp: newHP(opts.size), turn:0,
    p1:{gold:1,peasants:0,footmen:0,farmCap:opts.farmCap},
    p2:{gold:1,peasants:0,footmen:0,farmCap:opts.farmCap},
    pNeutral:opts.pNeutral, pEnemy:opts.pEnemy, defP:1, defE:2 });
  el.log.textContent='—'; render();
});

// init
el.log.textContent="Bienvenue en solo ! Achète 1 paysan (1 or), puis fin de tour.";
render();
