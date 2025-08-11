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
}
export function isConstructible(r,c){
  const d = Math.abs(r-centerR)+Math.abs(c-centerC);
  return d <= state.zoneRadius;
}
export function getCenterCell(){ return document.getElementById('centerCell'); }
