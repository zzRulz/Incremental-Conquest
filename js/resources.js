import { state } from './state.js';
import { getCenterIndex, pos, placeEmoji, occupy, idx } from './grid.js';

export function placeNaturalResources(){
  // Trees at prestige >=2: distance 1 from castle
  const treesWanted = state.prestige >= 2 ? Math.min(4, 1 + Math.floor((state.prestige - 2)/2)) : 0;
  const ci = getCenterIndex(); const [cr,cc] = pos(ci);
  const ring = []; // manhattan distance 1
  [[cr-1,cc],[cr+1,cc],[cr,cc-1],[cr,cc+1]].forEach(([r,c])=>{
    if(r<0||c<0) return;
    const ii = idx(r,c);
    ring.push(ii);
  });
  state.treePositions = []; state.rockPositions = [];
  let available = ring.filter(i=>!state.occupied.includes(i));
  for(let n=0;n<treesWanted && n<available.length;n++){
    const i = available[n];
    placeEmoji(i,'🌳','tree'); state.treePositions.push(i); occupy(i);
  }
  // Rocks: prestige / 3 near center (distance 2)
  const rocksWanted = Math.min(8, Math.floor(state.prestige / 3));
  const ring2 = [];
  [[cr-2,cc],[cr+2,cc],[cr,cc-2],[cr,cc+2]].forEach(([r,c])=>{ if(r>=0&&c>=0){ ring2.push(idx(r,c)); }});
  let av2 = ring2.filter(i=>!state.occupied.includes(i));
  for(let n=0;n<rocksWanted && n<av2.length;n++){
    const i = av2[n];
    placeEmoji(i,'🪨','rock'); state.rockPositions.push(i); occupy(i);
  }
}
