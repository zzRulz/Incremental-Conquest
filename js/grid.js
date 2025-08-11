import { CONFIG } from './config.js';
import { state } from './state.js';
const board = document.getElementById('board');
const zoneRSpan = document.getElementById('zoneR');
let cols, rows, centerR, centerC;
export function initGrid(){
  cols = CONFIG.GRID.cols; rows = CONFIG.GRID.rows;
  centerR = Math.floor(rows/2); centerC = Math.floor(cols/2);
  board.style.gridTemplateColumns = `repeat(${cols}, var(--tile))`;
  board.style.gridTemplateRows = `repeat(${rows}, var(--tile))`;
  board.innerHTML = '';
  // draw cells
  for (let r=0;r<rows;r++){
    for (let c=0;c<cols;c++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r; cell.dataset.c = c;
      if (r===centerR && c===centerC){ cell.classList.add('center','glow'); cell.id='centerCell'; }
      if (!isConstructible(r,c)) cell.classList.add('fog');
      board.appendChild(cell);
    }
  }
  zoneRSpan.textContent = String(state.zoneRadius);
  // repaint from saved state
  repaintFromState();
}
export function idx(r,c){ return r*cols + c; }
export function isConstructible(r,c){
  const d = Math.abs(r-centerR)+Math.abs(c-centerC);
  return d <= state.zoneRadius;
}
export function getCenterCell(){ return document.getElementById('centerCell'); }
export function getCellByIndex(i){ return board.children[i]; }
export function occupy(index){
  if (!state.occupied.includes(index)) state.occupied.push(index);
}
export function isOccupied(index){ return state.occupied.includes(index); }
export function getRandomFreeCell(avoidCenter=true){
  const free=[];
  for(let i=0;i<board.children.length;i++){
    if (isOccupied(i)) continue;
    const r=Math.floor(i/cols), c=i%cols;
    if (!isConstructible(r,c)) continue;
    if (avoidCenter && i===idx(centerR,centerC)) continue;
    free.push(i);
  }
  if(!free.length) return null;
  return free[Math.floor(Math.random()*free.length)];
}
export function placeEmoji(index, emoji, className){
  const cell = getCellByIndex(index);
  if(!cell) return;
  cell.classList.add(className);
  cell.textContent = emoji;
}
export function repaintFromState(){
  // clear classes/texts except fog and center
  for(let i=0;i<board.children.length;i++){
    const el = board.children[i];
    el.className = 'cell' + (el.id==='centerCell' ? ' center' : '');
    el.textContent = '';
    const r=Math.floor(i/cols), c=i%cols;
    if (!isConstructible(r,c)) el.classList.add('fog');
    if (el.id==='centerCell') el.classList.add('glow');
  }
  // castle
  if (state.castleBuilt){
    const cc = getCenterCell();
    cc.classList.remove('glow');
    cc.classList.add('chateau');
    cc.textContent = '🏰';
    occupy(idx(centerR,centerC));
  }
  // houses
  state.housePositions.forEach(i=>{
    placeEmoji(i,'🏠','house');
    occupy(i);
  });
}
