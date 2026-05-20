document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateClock();
  setInterval(updateClock, 1000);
  initSearch();
  initLinks();
  initModal();
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

// Search Management
function initSearch() {
  const tabs = document.querySelectorAll('.engine-tab');
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  
  const engines = {
    'google': { url: 'https://www.google.com/search', param: 'q', placeholder: 'Search Google...' },
    'duckduckgo': { url: 'https://duckduckgo.com/', param: 'q', placeholder: 'Search DuckDuckGo...' },
    'youtube': { url: 'https://www.youtube.com/results', param: 'search_query', placeholder: 'Search YouTube...' }
  };
  
  // Load saved engine
  const savedEngine = localStorage.getItem('searchEngine') || 'google';
  setEngine(savedEngine);
  
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const engine = e.target.getAttribute('data-engine');
      setEngine(engine);
      localStorage.setItem('searchEngine', engine);
    });
  });

  function setEngine(engineKey) {
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`.engine-tab[data-engine="${engineKey}"]`).classList.add('active');
    
    const config = engines[engineKey];
    form.action = config.url;
    input.name = config.param;
    input.placeholder = config.placeholder;
    input.focus();
  }
  
  // URL detection
  form.addEventListener('submit', (e) => {
    const query = input.value.trim();
    if (query) {
      const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i;
      // If it looks like a URL, go straight there instead of searching
      if (urlPattern.test(query) && !query.includes(' ')) {
        e.preventDefault();
        let url = query;
        if (!/^https?:\/\//i.test(url)) {
          url = 'https://' + url;
        }
        window.location.href = url;
      }
    }
  });
}

// Links Management
const defaultLinks = [
  { id: '1', name: 'GitHub', url: 'https://github.com', icon: 'ph-github-logo' },
  { id: '2', name: 'YouTube', url: 'https://youtube.com', icon: 'ph-youtube-logo' },
  { id: '3', name: 'Reddit', url: 'https://reddit.com', icon: 'ph-reddit-logo' },
  { id: '4', name: 'Mail', url: 'https://mail.google.com', icon: 'ph-envelope-simple' }
];

function initLinks() {
  renderLinks();
}

function getLinks() {
  const saved = localStorage.getItem('custom_links');
  if (saved) {
    return JSON.parse(saved);
  }
  return defaultLinks;
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
    el.href = link.url;
    el.className = 'dock-item';
    el.innerHTML = `
      <div class="icon-wrapper">
        <i class="ph ${link.icon || 'ph-link'}"></i>
      </div>
      <span>${link.name}</span>
    `;
    
    // Add context menu to delete
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if(confirm(`Remove ${link.name}?`)) {
        removeLink(link.id);
      }
    });

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
}

function removeLink(id) {
  let links = getLinks();
  links = links.filter(l => l.id !== id);
  saveLinks(links);
  renderLinks();
}

// Modal Management
function initModal() {
  const modal = document.getElementById('add-modal');
  const cancelBtn = document.getElementById('cancel-add');
  const saveBtn = document.getElementById('save-add');
  
  const nameInput = document.getElementById('link-name');
  const urlInput = document.getElementById('link-url');
  const iconInput = document.getElementById('link-icon');
  
  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    clearModal();
  });
  
  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    const icon = iconInput.value.trim() || 'ph-link';
    
    if (name && url) {
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      const links = getLinks();
      links.push({
        id: Date.now().toString(),
        name,
        url,
        icon
      });
      
      saveLinks(links);
      renderLinks();
      modal.classList.remove('active');
      clearModal();
    } else {
      alert('Please enter a name and URL');
    }
  });
  
  function clearModal() {
    nameInput.value = '';
    urlInput.value = '';
    iconInput.value = '';
  }
}
