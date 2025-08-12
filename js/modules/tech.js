import { CONFIG } from '../config.js';
import { state, setState } from '../state.js';

const techBtn = document.getElementById('techBtn');
const techModal = document.getElementById('techModal'); const techBackdrop = document.getElementById('techBackdrop'); const techClose = document.getElementById('techClose');
const techList = document.getElementById('techList');

export function initTech(){
  techBtn.addEventListener('click', ()=>{ techModal.classList.add('open'); render(); });
  techBackdrop.addEventListener('click', ()=> techModal.classList.remove('open'));
  techClose.addEventListener('click', ()=> techModal.classList.remove('open'));
}
function render(){
  techList.innerHTML='';
  CONFIG.TECH.forEach(t=>{
    const taken = !!state.tech[t.id];
    const el = document.createElement('div'); el.className='modal-section';
    el.innerHTML = `<div><b>${t.name}</b> ${taken?'<span class="small muted">[recherché]</span>':''}</div>`;
    const info = document.createElement('div'); info.className='small muted'; info.textContent = t.bonus?('Bonus: '+Object.entries(t.bonus).map(([k,v])=>`${k}+${Math.round((v-1)*100)}%`).join(', ')):(t.effect||'—');
    el.appendChild(info);
    const btn = document.createElement('button'); btn.className='btn'; btn.textContent = taken? 'Pris' : `Rechercher (${t.cost} science)`;
    btn.disabled = taken || state.science < t.cost;
    btn.addEventListener('click', ()=>{
      if(state.science < t.cost || state.tech[t.id]) return;
      state.science -= t.cost;
      state.tech[t.id] = true;
      applyTechEffects(t);
      setState({ science: state.science, tech: state.tech, techBonus: state.techBonus });
      render();
    });
    el.appendChild(btn);
    techList.appendChild(el);
  });
}
export function applyTechEffects(t){
  if(t.bonus){
    for(const [k,v] of Object.entries(t.bonus)){ state.techBonus[k] = (state.techBonus[k]||1)*v; }
  }
  if(t.effect==='+cap50'){ state.woodCap+=50; state.stoneCap+=50; }
  if(t.effect==='market+10'){ state.tech['log']=true; } // flag utilisé dans le marché
}
