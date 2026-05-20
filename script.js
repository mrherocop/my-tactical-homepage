document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateClock();
  setInterval(updateClock, 1000);
  initSearch();
  initLinks();
  initLinkModal();
  initEngineModal();
  initWidgets();
  initWidgetModal();
});

// Theme Management
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = themeToggleBtn.querySelector('i');
  
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  applyTheme(currentTheme, themeIcon);

  themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme, themeIcon);
    localStorage.setItem('theme', currentTheme);
  });
}

function applyTheme(theme, iconEl) {
  document.documentElement.setAttribute('data-theme', theme);
  const lightBg = document.getElementById('light-bg');
  const darkBg = document.getElementById('dark-bg');
  
  if (theme === 'dark') {
    iconEl.className = 'ph ph-sun';
    darkBg.classList.add('active');
    lightBg.classList.remove('active');
  } else {
    iconEl.className = 'ph ph-moon';
    lightBg.classList.add('active');
    darkBg.classList.remove('active');
  }
}

// Clock Management
function updateClock() {
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  
  const now = new Date();
  
  let hours = now.getHours();
  let minutes = now.getMinutes();
  minutes = minutes < 10 ? '0' + minutes : minutes;
  hours = hours < 10 ? '0' + hours : hours;
  timeEl.textContent = `${hours}:${minutes}`;
  
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString('en-US', options);
}

// --- Search Engine Management ---
const defaultEngines = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search', param: 'q' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/', param: 'q' },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results', param: 'search_query' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search', param: 'q' },
  { id: 'wikipedia', name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Special:Search', param: 'search' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/search', param: 'q' },
  { id: 'github', name: 'GitHub', url: 'https://github.com/search', param: 'q' }
];

function getEngines() {
  const saved = localStorage.getItem('search_engines');
  if (saved) return JSON.parse(saved);
  return defaultEngines;
}

function saveEngines(engines) {
  localStorage.setItem('search_engines', JSON.stringify(engines));
}

function initSearch() {
  const selectEl = document.getElementById('engine-select');
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  
  function renderDropdown() {
    const engines = getEngines();
    selectEl.innerHTML = '';
    
    engines.forEach(eng => {
      const option = document.createElement('option');
      option.value = eng.id;
      option.textContent = eng.name;
      selectEl.appendChild(option);
    });
    
    const savedEngineId = localStorage.getItem('activeEngine') || 'google';
    if (engines.some(e => e.id === savedEngineId)) {
      selectEl.value = savedEngineId;
    } else {
      selectEl.value = engines[0].id;
    }
    
    updateFormFromSelection();
  }

  function updateFormFromSelection() {
    const engines = getEngines();
    const active = engines.find(e => e.id === selectEl.value) || engines[0];
    form.action = active.url;
    input.name = active.param;
    input.placeholder = `Search ${active.name}...`;
    input.focus();
  }

  selectEl.addEventListener('change', () => {
    localStorage.setItem('activeEngine', selectEl.value);
    updateFormFromSelection();
  });

  // URL detection
  form.addEventListener('submit', (e) => {
    const query = input.value.trim();
    if (query) {
      const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i;
      if (urlPattern.test(query) && !query.includes(' ')) {
        e.preventDefault();
        let url = query;
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        window.location.href = url;
      }
    }
  });

  window.renderEngineDropdown = renderDropdown;
  renderDropdown();
}

function initEngineModal() {
  const modal = document.getElementById('engine-modal');
  const cancelBtn = document.getElementById('cancel-engine');
  const saveBtn = document.getElementById('save-engine');
  const openBtn = document.getElementById('open-engine-modal');
  
  const nameInput = document.getElementById('engine-name');
  const urlInput = document.getElementById('engine-url');
  const paramInput = document.getElementById('engine-param');
  
  openBtn.addEventListener('click', () => {
    modal.classList.add('active');
  });

  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    nameInput.value = ''; urlInput.value = ''; paramInput.value = '';
  });
  
  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    const param = paramInput.value.trim() || 'q';
    
    if (name && url) {
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      
      const engines = getEngines();
      const newId = Date.now().toString();
      engines.push({
        id: newId,
        name,
        url,
        param
      });
      
      saveEngines(engines);
      localStorage.setItem('activeEngine', newId);
      if (window.renderEngineDropdown) window.renderEngineDropdown();
      
      modal.classList.remove('active');
      nameInput.value = ''; urlInput.value = ''; paramInput.value = '';
    } else {
      alert('Please enter a name and URL');
    }
  });

  // Right click to remove active engine
  const selectEl = document.getElementById('engine-select');
  selectEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const activeId = selectEl.value;
    const engines = getEngines();
    const activeEng = engines.find(eng => eng.id === activeId);
    
    if (defaultEngines.some(de => de.id === activeId)) {
      alert("Cannot delete default search engine.");
      return;
    }
    
    if (activeEng && confirm(`Remove ${activeEng.name} search engine?`)) {
      const filtered = engines.filter(eng => eng.id !== activeId);
      saveEngines(filtered);
      localStorage.setItem('activeEngine', 'google');
      if (window.renderEngineDropdown) window.renderEngineDropdown();
    }
  });
}

// --- Links Management ---
const defaultLinks = [
  { id: '1', name: 'GitHub', url: 'https://github.com', icon: 'ph-github-logo' },
  { id: '2', name: 'YouTube', url: 'https://youtube.com', icon: 'ph-youtube-logo' },
  { id: '3', name: 'Reddit', url: 'https://reddit.com', icon: 'ph-reddit-logo' },
  { id: '4', name: 'Mail', url: 'https://mail.google.com', icon: 'ph-envelope-simple' }
];

let isEditMode = false;

function initLinks() {
  if (localStorage.getItem('custom_links') === null) {
    saveLinks(defaultLinks);
  }
  renderLinks();
}

function getLinks() {
  const saved = localStorage.getItem('custom_links');
  if (saved) return JSON.parse(saved);
  return [];
}

function saveLinks(links) {
  localStorage.setItem('custom_links', JSON.stringify(links));
}

function renderLinks() {
  const container = document.getElementById('links-container');
  const links = getLinks();
  
  container.innerHTML = '';
  
  links.forEach(link => {
    const el = document.createElement('a');
    el.href = isEditMode ? '#' : link.url;
    el.className = 'dock-item' + (isEditMode ? ' edit-mode' : '');
    
    let iconHTML = '';
    if (link.icon && link.icon.startsWith('ph-')) {
      iconHTML = `<i class="ph ${link.icon}"></i>`;
    } else {
      try {
        const domain = new URL(link.url).hostname;
        iconHTML = `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" alt="${link.name}" style="width:24px; height:24px; border-radius:4px;">`;
      } catch(e) {
        iconHTML = `<i class="ph ph-link"></i>`;
      }
    }

    el.innerHTML = `
      <div class="icon-wrapper">
        ${iconHTML}
        ${isEditMode ? '<div class="delete-badge"><i class="ph ph-x"></i></div>' : ''}
      </div>
      <span>${link.name}</span>
    `;
    
    if (isEditMode) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        removeLink(link.id);
      });
    } else {
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if(confirm(`Remove ${link.name}?`)) {
          removeLink(link.id);
        }
      });
    }

    container.appendChild(el);
  });
  
  const addBtn = document.createElement('button');
  addBtn.className = 'add-link-btn';
  addBtn.id = 'open-add-modal';
  addBtn.innerHTML = `
    <div class="icon-wrapper">
      <i class="ph ph-plus"></i>
    </div>
    <span>Add</span>
  `;
  addBtn.addEventListener('click', () => {
    document.getElementById('add-modal').classList.add('active');
  });
  container.appendChild(addBtn);

  const editBtn = document.createElement('button');
  editBtn.className = 'add-link-btn';
  editBtn.innerHTML = `
    <div class="icon-wrapper" style="border: 1px dashed var(--text-muted);">
      <i class="ph ${isEditMode ? 'ph-check' : 'ph-pencil'}"></i>
    </div>
    <span>${isEditMode ? 'Done' : 'Edit'}</span>
  `;
  editBtn.addEventListener('click', () => {
    isEditMode = !isEditMode;
    renderLinks();
    renderWidgets(); // Also toggle edit mode for widgets
  });
  container.appendChild(editBtn);
}

function removeLink(id) {
  let links = getLinks();
  links = links.filter(l => l.id !== id);
  saveLinks(links);
  renderLinks();
}

function initLinkModal() {
  const modal = document.getElementById('add-modal');
  const cancelBtn = document.getElementById('cancel-add');
  const saveBtn = document.getElementById('save-add');
  
  const nameInput = document.getElementById('link-name');
  const urlInput = document.getElementById('link-url');
  const iconInput = document.getElementById('link-icon');
  
  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    nameInput.value = ''; urlInput.value = ''; iconInput.value = '';
  });
  
  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    const icon = iconInput.value.trim();
    
    if (name && url) {
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      
      const links = getLinks();
      links.push({ id: Date.now().toString(), name, url, icon });
      saveLinks(links);
      renderLinks();
      
      modal.classList.remove('active');
      nameInput.value = ''; urlInput.value = ''; iconInput.value = '';
    } else {
      alert('Please enter a name and URL');
    }
  });
}

// --- Custom Widgets Management ---

function getWidgets() {
  const saved = localStorage.getItem('custom_widgets');
  if (saved) return JSON.parse(saved);
  return [];
}

function saveWidgets(widgets) {
  localStorage.setItem('custom_widgets', JSON.stringify(widgets));
}

function initWidgets() {
  renderWidgets();
}

function renderWidgets() {
  const container = document.getElementById('widgets-grid');
  if (!container) return;
  const widgets = getWidgets();
  
  container.innerHTML = '';
  
  widgets.forEach(widget => {
    const el = document.createElement('div');
    el.className = 'custom-widget-box' + (isEditMode ? ' edit-mode' : '');
    el.innerHTML = `
      <div class="widget-content">${widget.code}</div>
      ${isEditMode ? '<button class="delete-widget-btn"><i class="ph ph-x"></i></button>' : ''}
    `;
    
    if (isEditMode) {
      const delBtn = el.querySelector('.delete-widget-btn');
      if(delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          removeWidget(widget.id);
        });
      }
    }
    
    container.appendChild(el);
  });
}

function removeWidget(id) {
  let widgets = getWidgets();
  widgets = widgets.filter(w => w.id !== id);
  saveWidgets(widgets);
  renderWidgets();
}

function initWidgetModal() {
  const modal = document.getElementById('widget-modal');
  const cancelBtn = document.getElementById('cancel-widget');
  const saveBtn = document.getElementById('save-widget');
  const openBtn = document.getElementById('open-widget-modal');
  
  const codeInput = document.getElementById('widget-code');
  
  if(openBtn) {
    openBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    codeInput.value = '';
  });
  
  saveBtn.addEventListener('click', () => {
    const code = codeInput.value.trim();
    
    if (code) {
      const widgets = getWidgets();
      widgets.push({ id: Date.now().toString(), code });
      saveWidgets(widgets);
      renderWidgets();
      
      modal.classList.remove('active');
      codeInput.value = '';
    } else {
      alert('Please paste some HTML or iframe code');
    }
  });
}
