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
  const widgets = getWidgets();
  widgets.forEach(w => {
    const el = document.createElement('div');
    el.className = 'custom-widget-box';
    el.draggable = true;
    el.dataset.id = w.id;
    el.innerHTML = `<div class="widget-content">${w.code}</div><button class="delete-widget-btn"><i class="ph ph-x"></i></button>`;
    // Delete
    el.querySelector('.delete-widget-btn').addEventListener('click', () => {
      saveWidgets(getWidgets().filter(x => x.id !== w.id));
      renderWidgets();
    });
    // Drag start
    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', w.id);
      e.currentTarget.classList.add('dragging');
    });
    el.addEventListener('dragend', e => {
      e.currentTarget.classList.remove('dragging');
    });
    // Allow drop on other widgets
    el.addEventListener('dragover', e => e.preventDefault());
    el.addEventListener('drop', e => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      if (draggedId === w.id) return;
      const widgetsArr = getWidgets();
      const draggedIdx = widgetsArr.findIndex(x => x.id === draggedId);
      const targetIdx = widgetsArr.findIndex(x => x.id === w.id);
      if (draggedIdx > -1 && targetIdx > -1) {
        const [moved] = widgetsArr.splice(draggedIdx, 1);
        widgetsArr.splice(targetIdx, 0, moved);
        saveWidgets(widgetsArr);
        renderWidgets();
      }
    });
    c.appendChild(el);
  });
}
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
    drawer.classList.add('open');
    overlay.classList.add('active');
    renderWallpaperGrids();
  });

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

// Wallpaper rendering functions
function renderWallpaperGrids() {
  renderWpGrid('light', 'light-wp-grid');
  renderWpGrid('dark', 'dark-wp-grid');
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

    // Delete button for custom wallpapers
    if (!img.preset) {
      const del = document.createElement('button');
      del.className = 'del-wp';
      del.innerHTML = '<i class="ph ph-x"></i>';
      del.title = 'Delete';
      del.addEventListener('click', ev => {
        ev.stopPropagation();
        const key = mode === 'light' ? 'lightImages' : 'darkImages';
        d[key] = d[key].filter(i => i.id !== img.id);
        if (d[selKey] === img.id) {
          d[selKey] = d[key][0]?.id || '';
        }
        saveBgData(d);
        if (mode === currentTheme) applyBackground();
        renderWallpaperGrids();
      });
      thumb.appendChild(del);
    }

    // Select wallpaper on click
    thumb.addEventListener('click', () => {
      d[selKey] = img.id;
      saveBgData(d);
      if (mode === currentTheme) applyBackground();
      renderWallpaperGrids();
    });
    grid.appendChild(thumb);
  });
}

// Apply color theme function removed
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
