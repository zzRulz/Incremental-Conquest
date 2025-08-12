import { CONFIG } from './config.js';
import { state } from './state.js';
import { handleClickDown, handleClickUp } from './clicker.js';

const board = document.getElementById('board');
const zoneRSpan = document.getElementById('zoneR');
let cols, rows, centerR, centerC;

export function initGrid(){
  cols = CONFIG.GRID.cols; rows = CONFIG.GRID.rows;
  centerR = Math.floor(rows/2); centerC = Math.floor(cols/2);
  board.style.gridTemplateColumns = `repeat(${cols}, var(--tile))`;
  board.style.gridTemplateRows = `repeat(${rows}, var(--tile))`;
  board.innerHTML = '';
  for (let r=0;r<rows;r++){
    for (let c=0;c<cols;c++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r; cell.dataset.c = c;
      if(r===centerR && c===centerC){ cell.classList.add('center'); cell.id='centerCell'; }
      board.appendChild(cell);
    }
  }
  zoneRSpan.textContent = state.zoneRadius;
}

export function idx(r,c){ return r*cols + c; }
export function pos(i){ const r=Math.floor(i/cols), c=i%cols; return [r,c]; }
export function getCenterIndex(){ return idx(Math.floor(rows/2), Math.floor(cols/2)); }
export function occupy(i){ if(!state.occupied.includes(i)) state.occupied.push(i); }
function isInZone(r,c){ return Math.max(Math.abs(r-centerR), Math.abs(c-centerC)) <= state.zoneRadius; }

export function getRandomFreeCell(inZone=true){
  const free = [];
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      if(inZone && !isInZone(r,c)) continue;
      const i = idx(r,c);
      if(i===getCenterIndex()) continue;
      if(!state.occupied.includes(i)) free.push(i);
    }
  }
  if(free.length===0) return null;
  return free[Math.floor(Math.random()*free.length)];
}
export function getFreeAdjacentTo(list){
  // return a random free index that is 4-adjacent (Manhattan 1) to any i in list
  const candidates = new Set();
  for(const ti of list){
    const r=Math.floor(ti/cols), c=ti%cols;
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
  if(arr.length===0) return null;
  return arr[Math.floor(Math.random()*arr.length)];
}

export function placeEmoji(i,emoji,kind){
  const el = board.children[i];
  el.textContent = emoji;
  el.dataset.kind = kind;
  el.dataset.index = i;
  el.addEventListener('mousedown', handleClickDown);
  el.addEventListener('mouseup', handleClickUp);
  el.addEventListener('click', handleClickUp);
  occupy(i);
}

export function repaintFromState(){
  // clear
  const nodes=board.children;
  for(let i=0;i<nodes.length;i++){
    nodes[i].className='cell';
    nodes[i].textContent='';
    nodes[i].removeAttribute('data-kind');
    nodes[i].removeAttribute('data-index');
  }
  // center
  const ci=getCenterIndex();
  const cc=board.children[ci];
  cc.classList.add('center'); cc.id='centerCell';

  // trees & rocks
  state.treePositions.forEach(i=>{ placeEmoji(i,'🌳','tree'); });
  state.rockPositions.forEach(i=>{ placeEmoji(i,'🪨','rock'); });

  // castle
  if(state.castleBuilt){ placeEmoji(ci,'🏰','castle'); }

  // buildings
  state.housePositions.forEach(i=>{ placeEmoji(i,'🏠','house'); });
  state.fieldPositions.forEach(i=>{ placeEmoji(i,'🌾','field'); });
  state.campPositions.forEach(i=>{ placeEmoji(i,'🪓','camp'); });
  state.minePositions.forEach(i=>{ placeEmoji(i,'⛏️','mine'); });
  state.millPositions.forEach(i=>{ placeEmoji(i,'🌬️','mill'); });
  state.warePositions.forEach(i=>{ placeEmoji(i,'📦','warehouse'); });
  state.marketPositions.forEach(i=>{ placeEmoji(i,'🏪','market'); });
}

export function setDepletedClass(){
  const nodes = board.children;
  for(let i=0;i<nodes.length;i++){
    const kind = nodes[i].dataset.kind;
    if(!kind) continue;
    let key = (kind==='field'||kind==='camp'||kind==='mine'||kind==='castle')?kind:null;
    if(!key) continue;
    const enough = (state.stamina[key]||0) >= 10;
    if(enough) nodes[i].classList.remove('depleted'); else nodes[i].classList.add('depleted');
  }
}
