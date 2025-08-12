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
      if(r===centerR && c===centerC){ cell.classList.add('center','glow'); cell.id='centerCell'; }
      board.appendChild(cell);
    }
  }
  zoneRSpan.textContent = state.zoneRadius;
}

export function idx(r,c){ return r*cols + c; }
export function getCenterCell(){ return document.getElementById('centerCell'); }
export function occupy(i){ if(!state.occupied.includes(i)) state.occupied.push(i); }
function isConstructible(r,c){ return Math.max(Math.abs(r-centerR), Math.abs(c-centerC)) <= state.zoneRadius; }

export function getRandomFreeCell(inZone=true){
  const free = [];
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      if(inZone && !isConstructible(r,c)) continue;
      const i = idx(r,c);
      if(i===idx(centerR,centerC)) continue;
      if(!state.occupied.includes(i)) free.push(i);
    }
  }
  if(free.length===0) return null;
  return free[Math.floor(Math.random()*free.length)];
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
  const cc=board.children[idx(centerR,centerC)];
  cc.classList.add('center','glow'); cc.id='centerCell';

  // trees & rocks
  state.treePositions.forEach(i=>{ placeEmoji(i,'🌳','tree'); });
  state.rockPositions.forEach(i=>{ placeEmoji(i,'🪨','rock'); });

  // castle
  if(state.castleBuilt){ placeEmoji(idx(centerR,centerC),'🏰','castle'); }

  // buildings
  state.housePositions.forEach(i=>{ placeEmoji(i,'🏠','house'); });
  state.fieldPositions.forEach(i=>{ placeEmoji(i,'🌾','field'); });
  state.campPositions.forEach(i=>{ placeEmoji(i,'🪓','camp'); });
  state.minePositions.forEach(i=>{ placeEmoji(i,'⛏️','mine'); });
}
