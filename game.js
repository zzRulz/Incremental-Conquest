// Simple incremental core
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const SCREENS = {
  menu: $("#screen-menu"),
  game: $("#screen-game"),
};

// Persistent settings
const Settings = {
  music: 40,
  sfx: 60,
  gfx: "rtx",
  load(){
    try {
      const raw = JSON.parse(localStorage.getItem("conquete_settings")||"{}");
      Object.assign(this, raw);
    } catch(e){}
  },
  save(){
    localStorage.setItem("conquete_settings", JSON.stringify({music:this.music,sfx:this.sfx,gfx:this.gfx}));
  }
};

// Game state
const State = {
  gold: 0,
  prestigePoints: 0,
  tick: 0,
  buildings: {
    Castle: { level: 1, built:true, baseIncome: 2, upkeep: 1, progress: 0, progressRate: 0.02 },
    House:  { level: 0, built:false, baseIncome: 1, upkeep: 0, progress: 0, progressRate: 0.03 },
    Market: { level: 0, built:false, baseIncome: 3, upkeep: 1, progress: 0, progressRate: 0.015 },
  },
  load(){
    try {
      const raw = JSON.parse(localStorage.getItem("conquete_save")||"{}");
      if (raw && raw.buildings){
        Object.assign(this, raw);
      }
    } catch(e){}
  },
  save(){
    localStorage.setItem("conquete_save", JSON.stringify(this));
  },
  hardReset(){
    this.gold = 0;
    this.tick = 0;
    // IMPORTANT: château revient niveau 1 après prestige; autres bâtiments reset
    this.buildings = {
      Castle: { level: 1, built:true, baseIncome: 2, upkeep: 1, progress: 0, progressRate: 0.02 },
      House:  { level: 0, built:false, baseIncome: 1, upkeep: 0, progress: 0, progressRate: 0.03 },
      Market: { level: 0, built:false, baseIncome: 3, upkeep: 1, progress: 0, progressRate: 0.015 },
    };
    this.save();
  }
};

Settings.load();
State.load();

// UI references
const netIncomeEl = $("#net-income");
const goldEl = $("#gold");
const incomeEl = $("#income");
const upkeepEl = $("#upkeep");
const prestigeEl = $("#prestigePoints");
const builtList = $("#built-list");
const buildMenu = $("#build-menu");

// Menu buttons
$("#btn-play").addEventListener("click", ()=>{
  showScreen("game");
});
$("#btn-settings").addEventListener("click", ()=> openSettings());
$("#close-settings").addEventListener("click", ()=> closeSettings());
$("#save-settings").addEventListener("click", ()=> saveSettings());
$("#btn-exit").addEventListener("click", ()=> showScreen("menu"));

function showScreen(which){
  Object.values(SCREENS).forEach(s=>s.classList.remove("visible"));
  SCREENS[which].classList.add("visible");
}

// SETTINGS PANEL
function openSettings(){
  const modal = $("#settings-modal");
  modal.classList.add("open");
  // Apply current values
  $("#music").value = Settings.music;
  $("#sfx").value = Settings.sfx;
  const gfxRtx = $("#gfx-rtx");
  const gfxPotato = $("#gfx-potato");
  if (Settings.gfx === "rtx") gfxRtx.checked = true; else gfxPotato.checked = true;
}
function closeSettings(){
  $("#settings-modal").classList.remove("open");
}
function saveSettings(){
  Settings.music = parseInt($("#music").value, 10);
  Settings.sfx = parseInt($("#sfx").value, 10);
  const gfx = document.querySelector('input[name="gfx"]:checked')?.value || "rtx";
  Settings.gfx = gfx;
  Settings.save();
  closeSettings();
}

// BUILDING CARD FACTORIES (Unified style left & right)
function buildingIncome(b){
  // Scaling with level
  return Math.floor(b.baseIncome * Math.max(0, b.level));
}
function buildingUpkeep(b){
  // Simple upkeep per building if built
  return b.built ? b.upkeep : 0;
}
function totalIncome(){
  let inc = 0;
  Object.values(State.buildings).forEach(b=>{ if (b.built) inc += buildingIncome(b); });
  return inc;
}
function totalUpkeep(){
  let up = 0;
  Object.values(State.buildings).forEach(b=>{ up += buildingUpkeep(b); });
  return up;
}

function renderEconomy(){
  const inc = totalIncome();
  const upk = totalUpkeep();
  const net = inc - upk;
  goldEl.textContent = Math.floor(State.gold);
  incomeEl.textContent = inc;
  upkeepEl.textContent = upk;
  prestigeEl.textContent = State.prestigePoints;
  netIncomeEl.textContent = `${net>=0?'+':''}${net} / tick`;
  netIncomeEl.classList.toggle("positive", net>=0);
  netIncomeEl.classList.toggle("negative", net<0);
}

function renderBuilt(){
  builtList.innerHTML = "";
  // Only show built == true (fix: buildings don't appear if not constructed)
  Object.entries(State.buildings).forEach(([name, b])=>{
    if (!b.built) return;
    builtList.appendChild(cardForBuilt(name, b));
  });
}
function renderBuildMenu(){
  buildMenu.innerHTML = "";
  Object.entries(State.buildings).forEach(([name, b])=>{
    // Right menu shows both: upgrades for built, and option to construct for not built
    buildMenu.appendChild(cardForBuildAction(name, b));
  });
}

function cardForBuilt(name, b){
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="card-header">
      <div class="card-title">${name}</div>
      <div class="level">Lvl ${b.level}</div>
    </div>
    <div class="progress"><div class="bar" style="width:${Math.min(100, b.progress*100)}%"></div></div>
    <div class="row">
      <div class="badge">+${buildingIncome(b)} inc</div>
      <div class="badge">-${buildingUpkeep(b)} upkeep</div>
    </div>
    <div class="actions">
      <button class="btn small" data-act="levelup">Upgrade</button>
    </div>
  `;
  card.querySelector('[data-act="levelup"]').addEventListener("click", ()=> levelUp(name));
  return card;
}

function cardForBuildAction(name, b){
  const card = document.createElement("div");
  card.className = "card";
  const canBuild = !b.built;
  card.innerHTML = `
    <div class="card-header">
      <div class="card-title">${name}</div>
      <div class="level">${b.built ? 'Lvl '+b.level : 'Non construit'}</div>
    </div>
    <div class="progress"><div class="bar" style="width:${Math.min(100, b.progress*100)}%"></div></div>
    <div class="row">
      <div class="badge">+${buildingIncome(b)} inc</div>
      <div class="badge">${b.upkeep} upkeep</div>
    </div>
    <div class="actions">
      ${canBuild ? '<button class="btn small primary" data-act="build">Construire</button>' : '<button class="btn small" data-act="levelup">Upgrade</button>'}
    </div>
  `;
  if (canBuild){
    card.querySelector('[data-act="build"]').addEventListener("click", ()=> buildIt(name));
  } else {
    card.querySelector('[data-act="levelup"]').addEventListener("click", ()=> levelUp(name));
  }
  return card;
}

function levelUp(name){
  const b = State.buildings[name];
  const cost = (b.level+1) * 10;
  if (State.gold >= cost){
    State.gold -= cost;
    b.level++;
    b.progress = 0;
    State.save();
    renderAll();
  } else {
    pingPill("Pas assez d'or (coût: "+cost+")");
  }
}

function buildIt(name){
  const b = State.buildings[name];
  const cost = 15;
  if (!b.built && State.gold >= cost){
    State.gold -= cost;
    b.built = true;
    b.level = Math.max(1, b.level);
    b.progress = 0;
    State.save();
    renderAll();
  } else if (!b.built){
    pingPill("Pas assez d'or (coût: "+cost+")");
  }
}

// Prestige
$("#btn-prestige").addEventListener("click", ()=>{
  // Simple prestige: +1 point par 100 or total
  const gain = Math.floor(State.gold / 100);
  if (!confirm(`Prestiger maintenant ? Vous gagnerez ${gain} point(s) de prestige et tout sera réinitialisé (le Château revient niveau 1).`)){
    return;
  }
  State.prestigePoints += gain;
  State.hardReset();
  renderAll();
  pingPill("Prestige effectué !");
});

// Feedback pill
function pingPill(text){
  netIncomeEl.textContent = text;
  netIncomeEl.classList.add("positive");
  setTimeout(renderEconomy, 1200);
}

// Ticker
function tick(){
  State.tick++;
  // income/upkeep
  const inc = totalIncome();
  const upk = totalUpkeep();
  const net = inc - upk;
  State.gold += Math.max(0, net);
  // progress bars animate
  Object.values(State.buildings).forEach(b=>{
    if (b.built){
      b.progress += b.progressRate;
      if (b.progress >= 1){
        b.progress = 0;
        // small auto-bonus: every fill gives +1 gold
        State.gold += 1;
      }
    }
  });
  if (State.tick % 10 === 0) State.save(); // autosave
  renderEconomy();
  renderProgressBars();
}
function renderProgressBars(){
  // Update bar widths without re-rendering all DOM
  [...$$(".card")].forEach((card, i)=>{
    const title = card.querySelector(".card-title")?.textContent;
    if (!title || !State.buildings[title]) return;
    const b = State.buildings[title];
    const bar = card.querySelector(".bar");
    if (bar) bar.style.width = Math.min(100, b.progress*100) + "%";
    const level = card.querySelector(".level");
    if (level) level.textContent = b.built ? "Lvl "+b.level : "Non construit";
  });
}

// Render all
function renderAll(){
  renderEconomy();
  renderBuilt();
  renderBuildMenu();
}

renderAll();
showScreen("menu");

// Start ticker
setInterval(tick, 1000);
