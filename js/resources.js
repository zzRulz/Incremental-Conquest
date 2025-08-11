import { state, setState } from './state.js';
import { getRandomFreeCell, placeEmoji, occupy } from './grid.js';

export function placeNaturalResources(){
  // trees: floor((prestige+1)/2) ; rocks: floor(prestige/3)
  const trees = Math.floor((state.prestige + 1) / 2);
  const rocks = Math.floor(state.prestige / 3);
  state.treePositions = []; state.rockPositions = [];
  for(let n=0;n<trees;n++){
    const i=getRandomFreeCell(true); if(i===null) break;
    state.treePositions.push(i); placeEmoji(i,'🌳','tree'); occupy(i);
  }
  for(let n=0;n<rocks;n++){
    const i=getRandomFreeCell(true); if(i===null) break;
    state.rockPositions.push(i); placeEmoji(i,'🪨','rock'); occupy(i);
  }
}
export function maybeUnlockBuilds(){
  const campCard=document.getElementById('campCard');
  const mineCard=document.getElementById('mineCard');
  const warehouseCard=document.getElementById('warehouseCard');
  if(state.firstHouse && state.treePositions.length>0) campCard.style.display='';
  if(state.firstHouse && state.prestige>=3 && state.rockPositions.length>0) mineCard.style.display='';
  if(state.firstHouse && state.prestige>=3) warehouseCard.style.display='';
}
export function setZzz(kind){
  const list=(kind==='camp'?state.campPositions:state.minePositions);
  list.forEach(i=>{
    const el=document.getElementById('board').children[i];
    if(!el.querySelector('.zzz')){ const z=document.createElement('div'); z.className='zzz'; z.textContent='ZzZ'; el.appendChild(z); }
  });
}
export function clearZzz(kind){
  const list=(kind==='camp'?state.campPositions:state.minePositions);
  list.forEach(i=>{
    const el=document.getElementById('board').children[i];
    const z=el.querySelector('.zzz'); if(z) z.remove();
  });
}
