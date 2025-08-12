import { state, setState } from './state.js';

const QUESTS = [
  { id:'q_gold100',  name:'Amasser 100 or',     cond: s=> s.totals.gold>=100,   reward: s=> setState({ gold: s.gold+25 }) },
  { id:'q_wheat200', name:'Récolter 200 blé',   cond: s=> s.totals.wheat>=200,  reward: s=> setState({ globalMult: s.globalMult*1.02 }) },
  { id:'q_wood200',  name:'Couper 200 bois',    cond: s=> s.totals.wood>=200,   reward: s=> setState({ woodCap: s.woodCap+50 }) },
  { id:'q_stone200', name:'Extraire 200 pierre',cond: s=> s.totals.stone>=200,  reward: s=> setState({ stoneCap: s.stoneCap+50 }) },
  { id:'q_sci100',   name:'Étudier 100 science',cond: s=> s.totals.science>=100,reward: s=> setState({ globalMult: s.globalMult*1.03 }) },
];

export function initQuests(){
  const btn = document.getElementById('questBtn');
  const modal = document.getElementById('questModal');
  const backdrop = document.getElementById('questBackdrop');
  const close = document.getElementById('questClose');
  const list = document.getElementById('questList');
  btn.addEventListener('click', ()=>{ modal.classList.add('open'); render(); });
  backdrop.addEventListener('click', ()=> modal.classList.remove('open'));
  close.addEventListener('click', ()=> modal.classList.remove('open'));

  function render(){
    list.innerHTML='';
    QUESTS.forEach(q=>{
      const done = !!state.quests[q.id];
      const el = document.createElement('div');
      el.className='modal-section';
      el.innerHTML = `<div>${q.name} ${done?'<span class="small muted">[réclamée]</span>':''}</div>`;
      const b = document.createElement('button'); b.className='btn'; b.textContent = done?'Obtenue':'Réclamer';
      b.disabled = done || !q.cond(state);
      b.addEventListener('click', ()=>{
        if(q.cond(state) && !state.quests[q.id]){
          q.reward(state);
          state.quests[q.id]=true; setState({ quests: state.quests });
          render();
        }
      });
      el.appendChild(b);
      list.appendChild(el);
    });
  }
}
