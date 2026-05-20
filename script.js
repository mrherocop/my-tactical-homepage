// ═══════════════════════════════════
// INIT
// ═══════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initBackground();
  initTheme();
  updateClock();
  setInterval(updateClock, 1000);
  initSearch();
  initEngineModal();
  initLinks();
  initLinkModal();
  initWidgets();
  initWidgetModal();
  initCustomizeDrawer();
});

// ═══════════════════════════════════
// BACKGROUND
// ═══════════════════════════════════
const PRESET_BG = {
  light: 'assets/light_bg.jpg',
  dark:  'assets/dark_bg.jpg'
};

function getBgData() {
  const d = localStorage.getItem('bg_data');
  return d ? JSON.parse(d) : {
    lightImages: [{ id: 'preset-light', src: PRESET_BG.light, preset: true }],
    darkImages:  [{ id: 'preset-dark',  src: PRESET_BG.dark,  preset: true }],
    selectedLight: 'preset-light',
    selectedDark:  'preset-dark'
  };
}
function saveBgData(d) { localStorage.setItem('bg_data', JSON.stringify(d)); }

let currentTheme = 'light';

function initBackground() {
  applyBackground();
}

function applyBackground() {
  const d = getBgData();
  const key = currentTheme === 'dark' ? 'selectedDark' : 'selectedLight';
  const imgs = currentTheme === 'dark' ? d.darkImages : d.lightImages;
  const img = imgs.find(i => i.id === d[key]) || imgs[0];
  const layer = document.getElementById('bg-active');
  if (img) layer.style.backgroundImage = `url("${img.src}")`;
}

// ═══════════════════════════════════
// THEME
// ═══════════════════════════════════
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const icon = btn.querySelector('i');
  const saved = localStorage.getItem('theme');
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  currentTheme = saved || (sysDark ? 'dark' : 'light');
  applyTheme(icon);

  btn.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme(icon);
  });
}

function applyTheme(iconEl) {
  document.documentElement.setAttribute('data-theme', currentTheme);
  iconEl.className = currentTheme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
  applyBackground();
  applyColorTheme();
}

// ═══════════════════════════════════
// CLOCK
// ═══════════════════════════════════
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  document.getElementById('time').textContent = `${h}:${m}`;
  document.getElementById('date').textContent = now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
}

// ═══════════════════════════════════
// SEARCH ENGINES
// ═══════════════════════════════════
const DEFAULT_ENGINES = [
  { id:'google',     name:'Google',     url:'https://www.google.com/search',                param:'q' },
  { id:'ddg',        name:'DuckDuckGo', url:'https://duckduckgo.com/',                       param:'q' },
  { id:'bing',       name:'Bing',       url:'https://www.bing.com/search',                   param:'q' },
  { id:'youtube',    name:'YouTube',    url:'https://www.youtube.com/results',               param:'search_query' },
  { id:'perplexity', name:'Perplexity', url:'https://www.perplexity.ai/search',              param:'q' },
  { id:'wikipedia',  name:'Wikipedia',  url:'https://en.wikipedia.org/wiki/Special:Search',  param:'search' },
  { id:'github',     name:'GitHub',     url:'https://github.com/search',                     param:'q' }
];

function getEngines() {
  const s = localStorage.getItem('search_engines');
  return s ? JSON.parse(s) : DEFAULT_ENGINES;
}
function saveEngines(e) { localStorage.setItem('search_engines', JSON.stringify(e)); }

function initSearch() {
  const sel = document.getElementById('engine-select');
  const form = document.getElementById('search-form');
  const inp = document.getElementById('search-input');

  function renderDropdown() {
    const engines = getEngines();
    sel.innerHTML = '';
    engines.forEach(e => {
      const o = document.createElement('option');
      o.value = e.id; o.textContent = e.name;
      sel.appendChild(o);
    });
    const active = localStorage.getItem('activeEngine') || 'google';
    sel.value = engines.some(e => e.id === active) ? active : engines[0].id;
    updateForm();
  }

  function updateForm() {
    const e = getEngines().find(x => x.id === sel.value) || getEngines()[0];
    form.action = e.url; inp.name = e.param;
    inp.placeholder = `Search ${e.name}...`;
  }

  sel.addEventListener('change', () => { localStorage.setItem('activeEngine', sel.value); updateForm(); });
  sel.addEventListener('contextmenu', e => {
    e.preventDefault();
    const id = sel.value;
    if (DEFAULT_ENGINES.some(d => d.id === id)) { alert('Cannot delete a default engine.'); return; }
    const eng = getEngines().find(x => x.id === id);
    if (eng && confirm(`Remove "${eng.name}"?`)) {
      saveEngines(getEngines().filter(x => x.id !== id));
      localStorage.setItem('activeEngine', 'google');
      renderDropdown();
    }
  });

  form.addEventListener('submit', e => {
    const q = inp.value.trim();
    if (q && /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i.test(q) && !q.includes(' ')) {
      e.preventDefault();
      window.location.href = /^https?:\/\//i.test(q) ? q : 'https://' + q;
    }
  });

  window.renderEngineDropdown = renderDropdown;
  renderDropdown();
}

function initEngineModal() {
  const modal = document.getElementById('engine-modal');
  const nameI = document.getElementById('engine-name');
  const urlI  = document.getElementById('engine-url');
  const paramI = document.getElementById('engine-param');

  document.getElementById('open-engine-modal').addEventListener('click', () => modal.classList.add('active'));
  document.getElementById('cancel-engine').addEventListener('click', () => { modal.classList.remove('active'); nameI.value=''; urlI.value=''; paramI.value=''; });
  document.getElementById('save-engine').addEventListener('click', () => {
    const name = nameI.value.trim(), param = paramI.value.trim() || 'q';
    let url = urlI.value.trim();
    if (!name || !url) { alert('Enter name and URL.'); return; }
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const newId = Date.now().toString();
    const engines = getEngines();
    engines.push({ id: newId, name, url, param });
    saveEngines(engines);
    localStorage.setItem('activeEngine', newId);
    window.renderEngineDropdown();
    modal.classList.remove('active');
    nameI.value=''; urlI.value=''; paramI.value='';
  });
}

// ═══════════════════════════════════
// QUICK LINKS
// ═══════════════════════════════════
const DEFAULT_LINKS = [
  { id:'1', name:'GitHub',  url:'https://github.com',       icon:'ph-github-logo' },
  { id:'2', name:'YouTube', url:'https://youtube.com',      icon:'ph-youtube-logo' },
  { id:'3', name:'Reddit',  url:'https://reddit.com',       icon:'ph-reddit-logo' },
  { id:'4', name:'Mail',    url:'https://mail.google.com',  icon:'ph-envelope-simple' }
];
let isEditMode = false;

function getLinks() {
  const s = localStorage.getItem('custom_links');
  return s ? JSON.parse(s) : null;
}
function saveLinks(l) { localStorage.setItem('custom_links', JSON.stringify(l)); }

function initLinks() {
  if (!localStorage.getItem('custom_links')) saveLinks(DEFAULT_LINKS);
  renderLinks();
}

function renderLinks() {
  const c = document.getElementById('links-container');
  c.innerHTML = '';
  (getLinks() || []).forEach(link => {
    const el = document.createElement('a');
    el.href = isEditMode ? '#' : link.url;
    el.className = 'dock-item' + (isEditMode ? ' edit-mode' : '');

    let iconHTML = link.icon && link.icon.startsWith('ph-')
      ? `<i class="ph ${link.icon}"></i>`
      : (() => {
          try { const d = new URL(link.url).hostname; return `<img src="https://www.google.com/s2/favicons?domain=${d}&sz=64" style="width:24px;height:24px;border-radius:4px;" alt="">`; }
          catch { return `<i class="ph ph-link"></i>`; }
        })();

    el.innerHTML = `<div class="icon-wrapper">${iconHTML}${isEditMode ? '<div class="delete-badge"><i class="ph ph-x"></i></div>' : ''}</div><span>${link.name}</span>`;

    if (isEditMode) {
      el.addEventListener('click', e => { e.preventDefault(); saveLinks((getLinks()||[]).filter(l=>l.id!==link.id)); renderLinks(); });
    } else {
      el.addEventListener('contextmenu', e => { e.preventDefault(); if(confirm(`Remove "${link.name}"?`)) { saveLinks((getLinks()||[]).filter(l=>l.id!==link.id)); renderLinks(); }});
    }
    c.appendChild(el);
  });

  // Add btn
  const add = document.createElement('button');
  add.className = 'add-link-btn';
  add.innerHTML = `<div class="icon-wrapper"><i class="ph ph-plus"></i></div><span>Add</span>`;
  add.addEventListener('click', () => document.getElementById('add-modal').classList.add('active'));
  c.appendChild(add);

  // Edit btn
  const edit = document.createElement('button');
  edit.className = 'add-link-btn';
  edit.innerHTML = `<div class="icon-wrapper" style="border:1px dashed var(--text-muted);"><i class="ph ${isEditMode?'ph-check':'ph-pencil'}"></i></div><span>${isEditMode?'Done':'Edit'}</span>`;
  edit.addEventListener('click', () => { isEditMode = !isEditMode; renderLinks(); renderWidgets(); });
  c.appendChild(edit);
}

function initLinkModal() {
  const modal = document.getElementById('add-modal');
  const nameI = document.getElementById('link-name');
  const urlI  = document.getElementById('link-url');
  const iconI = document.getElementById('link-icon');
  document.getElementById('cancel-add').addEventListener('click', () => { modal.classList.remove('active'); nameI.value=''; urlI.value=''; iconI.value=''; });
  document.getElementById('save-add').addEventListener('click', () => {
    const name = nameI.value.trim(); let url = urlI.value.trim(); const icon = iconI.value.trim();
    if (!name || !url) { alert('Enter name and URL.'); return; }
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const links = getLinks() || [];
    links.push({ id: Date.now().toString(), name, url, icon });
    saveLinks(links); renderLinks();
    modal.classList.remove('active'); nameI.value=''; urlI.value=''; iconI.value='';
  });
}

// ═══════════════════════════════════
// WIDGETS
// ═══════════════════════════════════
function getWidgets() { const s = localStorage.getItem('custom_widgets'); return s ? JSON.parse(s) : []; }
function saveWidgets(w) { localStorage.setItem('custom_widgets', JSON.stringify(w)); }

function initWidgets() { renderWidgets(); }

function renderWidgets() {
  const c = document.getElementById('widgets-grid');
  if (!c) return;
  c.innerHTML = '';
  getWidgets().forEach(w => {
    const el = document.createElement('div');
    el.className = 'custom-widget-box' + (isEditMode ? ' edit-mode' : '');
    el.innerHTML = `<div class="widget-content">${w.code}</div>${isEditMode ? '<button class="delete-widget-btn"><i class="ph ph-x"></i></button>' : ''}`;
    if (isEditMode) {
      el.querySelector('.delete-widget-btn').addEventListener('click', () => {
        saveWidgets(getWidgets().filter(x => x.id !== w.id)); renderWidgets();
      });
    }
    c.appendChild(el);
  });
}

function initWidgetModal() {
  const modal = document.getElementById('widget-modal');
  const codeI = document.getElementById('widget-code');
  document.getElementById('open-widget-modal').addEventListener('click', () => modal.classList.add('active'));
  document.getElementById('cancel-widget').addEventListener('click', () => { modal.classList.remove('active'); codeI.value=''; });
  document.getElementById('save-widget').addEventListener('click', () => {
    const code = codeI.value.trim();
    if (!code) { alert('Paste some code.'); return; }
    const ws = getWidgets(); ws.push({ id: Date.now().toString(), code });
    saveWidgets(ws); renderWidgets();
    modal.classList.remove('active'); codeI.value='';
  });
}

// ═══════════════════════════════════
// CUSTOMIZE DRAWER
// ═══════════════════════════════════
function initCustomizeDrawer() {
  const drawer  = document.getElementById('customize-drawer');
  const overlay = document.getElementById('drawer-overlay');

  document.getElementById('open-customize').addEventListener('click', () => {
    drawer.classList.add('open'); overlay.classList.add('active');
    renderWallpaperGrids(); renderPresets(); renderColorPickers();
  });
  const close = () => { drawer.classList.remove('open'); overlay.classList.remove('active'); };
  document.getElementById('close-customize').addEventListener('click', close);
  overlay.addEventListener('click', close);

  // Tabs
  document.querySelectorAll('.drawer-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.drawer-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  // Upload listeners
  document.getElementById('upload-light').addEventListener('change', e => handleUpload(e, 'light'));
  document.getElementById('upload-dark').addEventListener('change',  e => handleUpload(e, 'dark'));

  // Color theme save
  document.getElementById('save-custom-theme').addEventListener('click', saveCustomTheme);
}

// ──────────────────────────────────
// WALLPAPER
// ──────────────────────────────────
function handleUpload(e, mode) {
  const files = Array.from(e.target.files);
  const d = getBgData();
  const arr = mode === 'light' ? d.lightImages : d.darkImages;
  let count = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      arr.push({ id: `custom-${Date.now()}-${count++}`, src: ev.target.result, preset: false });
      saveBgData(d);
      renderWallpaperGrids();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
}

function renderWallpaperGrids() {
  renderWpGrid('light', 'light-wp-grid');
  renderWpGrid('dark',  'dark-wp-grid');
}

function renderWpGrid(mode, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const d = getBgData();
  const imgs = mode === 'light' ? d.lightImages : d.darkImages;
  const selKey = mode === 'light' ? 'selectedLight' : 'selectedDark';
  grid.innerHTML = '';
  imgs.forEach(img => {
    const thumb = document.createElement('div');
    thumb.className = 'wp-thumb' + (d[selKey] === img.id ? ' selected' : '');
    thumb.style.backgroundImage = `url("${img.src}")`;

    if (!img.preset) {
      const del = document.createElement('button');
      del.className = 'del-wp'; del.innerHTML = '<i class="ph ph-x"></i>';
      del.title = 'Delete';
      del.addEventListener('click', ev => { ev.stopPropagation(); deleteWallpaper(mode, img.id); });
      thumb.appendChild(del);
    }

    thumb.addEventListener('click', () => {
      d[selKey] = img.id;
      saveBgData(d);
      if (mode === currentTheme) applyBackground();
      renderWpGrid(mode, gridId);
    });
    grid.appendChild(thumb);
  });
}

function deleteWallpaper(mode, id) {
  const d = getBgData();
  const key = mode === 'light' ? 'lightImages' : 'darkImages';
  const selKey = mode === 'light' ? 'selectedLight' : 'selectedDark';
  d[key] = d[key].filter(i => i.id !== id);
  if (d[selKey] === id) d[selKey] = d[key][0]?.id || '';
  saveBgData(d);
  if (mode === currentTheme) applyBackground();
  renderWallpaperGrids();
}

// ──────────────────────────────────
// COLOR THEMES
// ──────────────────────────────────
const PRESET_THEMES = [
  {
    id:'forest', name:'Forest',
    light:{ '--bg-color':'#e5ecd9','--text-main':'#1d211b','--text-muted':'#5e6b57','--accent':'#2e4a30','--accent-hover':'#406342','--card-bg':'rgba(255,255,255,0.7)','--pill-bg':'rgba(255,255,255,0.8)' },
    dark: { '--bg-color':'#0b120f','--text-main':'#f0f4f1','--text-muted':'#94a39b','--accent':'#8eb392','--accent-hover':'#a8ccac','--card-bg':'rgba(30,38,33,0.7)','--pill-bg':'rgba(40,48,43,0.85)' },
    swatches:['#2e4a30','#e5ecd9','#8eb392']
  },
  {
    id:'ocean', name:'Ocean',
    light:{ '--bg-color':'#dce8f0','--text-main':'#0d1f2d','--text-muted':'#4a6274','--accent':'#1a5f7a','--accent-hover':'#276e8a','--card-bg':'rgba(255,255,255,0.7)','--pill-bg':'rgba(255,255,255,0.8)' },
    dark: { '--bg-color':'#060f17','--text-main':'#cde4f0','--text-muted':'#7aaabb','--accent':'#5bc4e8','--accent-hover':'#78cfe8','--card-bg':'rgba(10,30,45,0.75)','--pill-bg':'rgba(15,40,60,0.85)' },
    swatches:['#1a5f7a','#dce8f0','#5bc4e8']
  },
  {
    id:'rose', name:'Rose',
    light:{ '--bg-color':'#f8edf0','--text-main':'#2d1a1f','--text-muted':'#8a5564','--accent':'#c05070','--accent-hover':'#d06080','--card-bg':'rgba(255,255,255,0.72)','--pill-bg':'rgba(255,255,255,0.82)' },
    dark: { '--bg-color':'#1a080e','--text-main':'#f5dde4','--text-muted':'#b08090','--accent':'#e890a8','--accent-hover':'#f0a0b8','--card-bg':'rgba(50,20,30,0.75)','--pill-bg':'rgba(60,25,35,0.85)' },
    swatches:['#c05070','#f8edf0','#e890a8']
  },
  {
    id:'slate', name:'Slate',
    light:{ '--bg-color':'#e8eaed','--text-main':'#1a1c20','--text-muted':'#5a6070','--accent':'#4a5568','--accent-hover':'#5a6580','--card-bg':'rgba(255,255,255,0.7)','--pill-bg':'rgba(255,255,255,0.8)' },
    dark: { '--bg-color':'#0d0e12','--text-main':'#e2e4e8','--text-muted':'#8090a0','--accent':'#90a0b8','--accent-hover':'#a0b0c8','--card-bg':'rgba(20,22,28,0.78)','--pill-bg':'rgba(28,30,38,0.88)' },
    swatches:['#4a5568','#e8eaed','#90a0b8']
  },
  {
    id:'amber', name:'Amber',
    light:{ '--bg-color':'#fdf3e0','--text-main':'#2d1e00','--text-muted':'#8a6a30','--accent':'#c07020','--accent-hover':'#d08030','--card-bg':'rgba(255,255,255,0.72)','--pill-bg':'rgba(255,255,255,0.82)' },
    dark: { '--bg-color':'#180e00','--text-main':'#f5e8cc','--text-muted':'#b09060','--accent':'#e8a048','--accent-hover':'#f0b060','--card-bg':'rgba(40,25,5,0.78)','--pill-bg':'rgba(50,30,8,0.88)' },
    swatches:['#c07020','#fdf3e0','#e8a048']
  },
  {
    id:'midnight', name:'Midnight',
    light:{ '--bg-color':'#e8e8f5','--text-main':'#10102a','--text-muted':'#5050a0','--accent':'#4040c0','--accent-hover':'#5050d0','--card-bg':'rgba(255,255,255,0.72)','--pill-bg':'rgba(255,255,255,0.82)' },
    dark: { '--bg-color':'#08081e','--text-main':'#d8d8f8','--text-muted':'#8080c0','--accent':'#8080e8','--accent-hover':'#9090f0','--card-bg':'rgba(15,15,40,0.8)','--pill-bg':'rgba(20,20,50,0.88)' },
    swatches:['#4040c0','#e8e8f5','#8080e8']
  }
];

const COLOR_VARS = [
  { label:'Background',  key:'--bg-color' },
  { label:'Text',        key:'--text-main' },
  { label:'Muted Text',  key:'--text-muted' },
  { label:'Accent',      key:'--accent' },
  { label:'Accent Hover',key:'--accent-hover' }
];

function getActiveThemeId() { return localStorage.getItem('colorThemeId') || 'forest'; }
function getCustomColors()  { const s = localStorage.getItem('customColors'); return s ? JSON.parse(s) : null; }

function renderPresets() {
  const grid = document.getElementById('preset-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const active = getActiveThemeId();
  PRESET_THEMES.forEach(pt => {
    const card = document.createElement('div');
    card.className = 'preset-card' + (active === pt.id ? ' active' : '');
    card.style.background = pt.light['--bg-color'];
    card.innerHTML = `
      <div class="preset-swatches">${pt.swatches.map(s=>`<div class="swatch" style="background:${s}"></div>`).join('')}</div>
      <div class="preset-name" style="color:${pt.light['--text-main']}">${pt.name}</div>
    `;
    card.addEventListener('click', () => {
      localStorage.setItem('colorThemeId', pt.id);
      localStorage.removeItem('customColors');
      applyColorTheme();
      renderPresets();
    });
    grid.appendChild(card);
  });
}

function renderColorPickers() {
  const container = document.getElementById('color-pickers');
  if (!container) return;
  const themeId = getActiveThemeId();
  const preset = PRESET_THEMES.find(p => p.id === themeId) || PRESET_THEMES[0];
  const custom = getCustomColors() || {};
  const vars = currentTheme === 'dark' ? preset.dark : preset.light;

  container.innerHTML = '';
  COLOR_VARS.forEach(v => {
    const row = document.createElement('div');
    row.className = 'color-row';
    const currentVal = (custom[currentTheme] && custom[currentTheme][v.key]) || vars[v.key] || '#ffffff';
    row.innerHTML = `
      <label>${v.label}</label>
      <input type="color" data-var="${v.key}" value="${currentVal.trim()}">
    `;
    container.appendChild(row);
  });
}

function saveCustomTheme() {
  const pickers = document.querySelectorAll('#color-pickers input[type=color]');
  const custom = getCustomColors() || {};
  if (!custom[currentTheme]) custom[currentTheme] = {};
  pickers.forEach(p => { custom[currentTheme][p.dataset.var] = p.value; });
  localStorage.setItem('customColors', JSON.stringify(custom));
  applyColorTheme();
}

function applyColorTheme() {
  const themeId = getActiveThemeId();
  const preset = PRESET_THEMES.find(p => p.id === themeId) || PRESET_THEMES[0];
  const vars = currentTheme === 'dark' ? preset.dark : preset.light;
  const custom = getCustomColors();

  const merged = { ...vars, ...(custom && custom[currentTheme] ? custom[currentTheme] : {}) };
  Object.entries(merged).forEach(([k, v]) => {
    document.documentElement.style.setProperty(k, v);
  });
  // Keep blur and card-border / card-shadow separate
  document.documentElement.style.setProperty('--blur', 'blur(20px)');
  if (currentTheme === 'dark') {
    document.documentElement.style.setProperty('--card-border', 'rgba(255,255,255,0.07)');
    document.documentElement.style.setProperty('--card-shadow', '0 10px 40px rgba(0,0,0,0.3)');
  } else {
    document.documentElement.style.setProperty('--card-border', 'rgba(255,255,255,0.5)');
    document.documentElement.style.setProperty('--card-shadow', '0 10px 40px rgba(0,0,0,0.05)');
  }
}
