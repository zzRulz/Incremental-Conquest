import { state, setState } from '../state.js';
import { getRandomFreeCell, placeEmoji } from '../grid.js';
import { grantArtifact } from './artifacts.js';

export function maybeSpawnBoss(){
  if(state.boss.active) return;
  if(Math.random()<0.3){ // 30% chance on check
    const i = getRandomFreeCell(true);
    if(i==null) return;
    const hp = 20 + state.prestige*10 + state.zoneLevel*10;
    state.boss = { active:true, hp, max:hp, index:i, name:'Chef Brigand' };
    setState({ boss: state.boss });
    placeEmoji(i,'👹','boss');
  }
}
export function handleBossClick(e){
  if(!state.boss.active) return;
  const dmg = 1 + state.castleLevel + Math.floor((state.levels.field+state.levels.camp+state.levels.mine)/3);
  state.boss.hp = Math.max(0, state.boss.hp - dmg);
  if(state.boss.hp===0){
    // drop a random artifact
    const pool = ['ringGold','totemWood','runeStone','scythe','owl'];
    const id = pool[Math.floor(Math.random()*pool.length)];
    grantArtifact(id);
    state.boss = { active:false, hp:0, max:0, index:null, name:'' };
  }
  setState({ boss: state.boss });
}
