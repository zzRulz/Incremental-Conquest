import { CONFIG } from '../config.js';
import { state, setState } from '../state.js';

const artBtn = document.getElementById('artBtn');
const artModal = document.getElementById('artModal'); const artBackdrop = document.getElementById('artBackdrop'); const artClose = document.getElementById('artClose');
const artList = document.getElementById('artList');

export function initArtifacts(){
  artBtn.addEventListener('click', ()=>{ artModal.classList.add('open'); render(); });
  artBackdrop.addEventListener('click', ()=> artModal.classList.remove('open'));
  artClose.addEventListener('click', ()=> artModal.classList.remove('open'));
}
export function grantArtifact(id){
  if(state.artifacts.includes(id)) return false;
  state.artifacts.push(id);
  const def = CONFIG.ARTIFACTS.find(a=>a.id===id);
  if(def){
    if(def.bonus){ for(const [k,v] of Object.entries(def.bonus)){ state.artBonus[k] = (state.artBonus[k]||1)*v; } }
    if(def.effect==='+science1'){ state.clicks.library = (state.clicks.library||0); /* flag, applied in clicker */ state.artBonus['sciencePlus']=1; }
  }
  setState({ artifacts: state.artifacts, artBonus: state.artBonus });
  render();
  return true;
}
function render(){
  artList.innerHTML='';
  state.artifacts.forEach(id=>{
    const a = CONFIG.ARTIFACTS.find(x=>x.id===id);
    const el = document.createElement('div'); el.className='modal-section';
    el.innerHTML = `<div><b>${a?.name||id}</b> — <span class="small muted">${a?.desc||''}</span></div>`;
    artList.appendChild(el);
  });
  if(state.artifacts.length===0){
    const el = document.createElement('div'); el.className='small muted'; el.textContent = 'Aucun artéfact pour le moment.';
    artList.appendChild(el);
  }
}
