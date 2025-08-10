const SETTINGS_KEY = 'conquete_settings_v1';
const Settings = {
  load(){ try{ return Object.assign({ music:70, sfx:80, gfx:'patatos' }, JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')); }catch(e){ return { music:70, sfx:80, gfx:'patatos' }; } },
  save(data){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(data)); }
};
window.SettingsUI = {
  load(){
    const data = Settings.load();
    const music = document.getElementById('musicRange');
    const sfx = document.getElementById('sfxRange');
    if(music) music.value = data.music;
    if(sfx) sfx.value = data.sfx;
    const radios = document.querySelectorAll('input[name="gfx"]');
    radios.forEach(r => r.checked = (r.value === data.gfx));
    if(!window.__settings_bound){
      window.__settings_bound = true;
      music && music.addEventListener('input', ()=>{ const d=Settings.load(); d.music=parseInt(music.value,10); Settings.save(d); });
      sfx && sfx.addEventListener('input', ()=>{ const d=Settings.load(); d.sfx=parseInt(sfx.value,10); Settings.save(d); });
      radios.forEach(r => r.addEventListener('change', ()=>{ const d=Settings.load(); d.gfx=document.querySelector('input[name="gfx"]:checked')?.value || 'patatos'; Settings.save(d); }));
    }
  }
};
