import { state, setState } from './state.js';

export const ACHIEVEMENTS = [
  { id:'firstGold',   name:'Premières pièces', cond: s=> s.totals.gold>=10,     bonus: s=> setState({ globalMult: s.globalMult*1.01 }) },
  { id:'field100',    name:'Fermier',          cond: s=> s.clicks.field>=100,   bonus: s=> setState({ globalMult: s.globalMult*1.01 }) },
  { id:'wood100',     name:'Bûcheron',         cond: s=> s.clicks.camp>=100,    bonus: s=> setState({ globalMult: s.globalMult*1.01 }) },
  { id:'stone100',    name:'Mineur',           cond: s=> s.clicks.mine>=100,    bonus: s=> setState({ globalMult: s.globalMult*1.01 }) },
  { id:'critPlus',    name:'Visée',            cond: s=> (s.totals.gold+s.totals.wood+s.totals.stone)>=200, bonus: s=> { s.achievements['critPlus']=true; setState({ achievements: s.achievements }); } },
];

export function checkAchievements(){
  let unlocked = [];
  for(const a of ACHIEVEMENTS){
    if(state.achievements[a.id]) continue;
    if(a.cond(state)){
      state.achievements[a.id] = true;
      a.bonus(state);
      unlocked.push(a.name);
    }
  }
  if(unlocked.length>0){
    try {
      const list = document.getElementById('achList');
      const item = document.createElement('div');
      item.textContent = `Nouveaux succès: ${unlocked.join(', ')}`;
      list.prepend(item);
    } catch(_){}
  }
}
