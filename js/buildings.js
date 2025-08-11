import { CONFIG } from './config.js';
import { state, setState } from './state.js';
import { getCenterCell } from './grid.js';
import { beep } from './sound.js';
const castleFill = document.getElementById('castleFill');
const buildCastleBtn = document.getElementById('buildCastleBtn');
const castleMsg = document.getElementById('castleMsg');
export function initBuildings(){
  buildCastleBtn.addEventListener('click', buildCastle);
  if (state.castleBuilt){
    const center = getCenterCell();
    center.classList.remove('glow');
    center.classList.add('chateau'); center.textContent='🏰';
    document.getElementById('buildCastleBtn').disabled = true;
    document.querySelector('#castleCard .build-desc').innerHTML = `Production actuelle : <b>+${CONFIG.CASTLE.baseIncomePerTick} or / tick</b>`;
  }
}
function buildCastle(){
  if (state.castleBuilt) return;
  castleFill.style.transition='none'; castleFill.style.width='0%';
  requestAnimationFrame(()=>{ castleFill.style.transition='width 10s linear'; castleFill.style.width='100%'; });
  buildCastleBtn.disabled = true; castleMsg.textContent = 'Construction… (10s)';
  setTimeout(()=>{
    const center = getCenterCell();
    center.classList.remove('glow');
    center.classList.add('chateau'); center.textContent='🏰';
    setState({ castleBuilt: true, incomePerTick: CONFIG.CASTLE.baseIncomePerTick });
    // update card description
    document.querySelector('#castleCard .build-desc').innerHTML = `Production actuelle : <b>+${CONFIG.CASTLE.baseIncomePerTick} or / tick</b>`;
    castleMsg.textContent = '—';
    beep();
  }, CONFIG.CASTLE.buildTimeMs);
}
