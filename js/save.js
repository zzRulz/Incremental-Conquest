import { CONFIG } from './config.js';
import { state } from './state.js';

export function save(){
  try{ localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(state)); }catch(e){}
}
export function load(){
  try{
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if(!raw) return;
    const data = JSON.parse(raw);
    Object.assign(state, data);
  }catch(e){}
}
