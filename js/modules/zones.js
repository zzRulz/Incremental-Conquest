import { CONFIG } from '../config.js';
import { state, setState } from '../state.js';
import { placeNaturalResources } from '../resources.js';
import { repaintFromState } from '../grid.js';
import { refreshAll } from '../panel.js';

const zonesBtn = document.getElementById('zonesBtn');
const zonesModal = document.getElementById('zonesModal'); const zonesBackdrop = document.getElementById('zonesBackdrop'); const zonesClose = document.getElementById('zonesClose');
const zonesList = document.getElementById('zonesList');
const zoneName = document.getElementById('zoneName');

export function initZones(){
  zonesBtn.addEventListener('click', ()=>{ zonesModal.classList.add('open'); render(); });
  zonesBackdrop.addEventListener('click', ()=> zonesModal.classList.remove('open'));
  zonesClose.addEventListener('click', ()=> zonesModal.classList.remove('open'));
}

function render(){
  zonesList.innerHTML='';
  CONFIG.ZONES.forEach(z=>{
    const unlocked = state.zoneLevel >= z.id;
    const el = document.createElement('div'); el.className='modal-section';
    el.innerHTML = `<div><b>${z.name}</b> ${unlocked?'<span class="small muted">[débloquée]</span>':''}</div>`;
    const desc = document.createElement('div'); desc.className='small muted';
    const bonuses = Object.entries(z.bonus).map(([k,v])=>`${k}+${Math.round((v-1)*100)}%`).join(', ');
    desc.textContent = bonuses?`Bonus: ${bonuses}`:'—';
    el.appendChild(desc);
    if(!unlocked){
      const cost = z.cost || {};
      const btn = document.createElement('button'); btn.className='btn'; btn.textContent = `Débloquer (or:${cost.gold||0} bois:${cost.wood||0} pierre:${cost.stone||0} blé:${cost.wheat||0})`;
      btn.addEventListener('click', ()=>{
        if((state.gold||0)<(cost.gold||0) || (state.wood||0)<(cost.wood||0) || (state.stone||0)<(cost.stone||0) || (state.wheat||0)<(cost.wheat||0)) return;
        setState({ gold: state.gold-(cost.gold||0), wood: state.wood-(cost.wood||0), stone: state.stone-(cost.stone||0), wheat: state.wheat-(cost.wheat||0), zoneLevel: z.id, zoneRadius: state.zoneRadius+1, zoneBonus: z.bonus, zoneName: z.name });
        placeNaturalResources(); repaintFromState(); refreshAll(); zoneName.textContent = z.name; render();
      });
      el.appendChild(btn);
    } else {
      const tag = document.createElement('div'); tag.className='small muted'; tag.textContent='Active';
      el.appendChild(tag);
    }
    zonesList.appendChild(el);
  });
}
