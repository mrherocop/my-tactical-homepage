import base64

def get_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

light_b64 = get_b64("/tmp/light_bg.jpg")
dark_b64 = get_b64("/tmp/dark_bg.jpg")

svgs = {
    "google": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>',
    "search": '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    "github": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>',
    "youtube": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.16 1 12 1 12s0 3.84.46 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.84 23 12 23 12s0-3.84-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>',
    "mail": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
    "reddit": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M8 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M12 16.5c2 0 4-1 4-1s-2 1-4 1-4-1-4-1 2 1 4 1z"></path></svg>'
}


html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Tab</title>
  <style>
    /* Reset and Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&display=swap');
    * {{ margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }}
    
    body {{
      width: 100vw; height: 100vh; overflow: hidden;
      color: #1d211b; position: relative;
    }}

    /* CSS variables injected based on theme checkbox */
    #theme-toggle {{ display: none; }}
    
    .theme-vars {{
      --bg-color: #e5ecd9;
      --text-main: #1d211b;
      --text-muted: #5e6b57;
      --card-bg: rgba(255, 255, 255, 0.7);
      --card-border: rgba(255, 255, 255, 0.5);
      --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
      --accent: #2e4a30;
      --pill-bg: rgba(255, 255, 255, 0.8);
      --blur: blur(20px);
      --bg-img: url(data:image/jpeg;base64,{light_b64});
      height: 100%; width: 100%; transition: all 0.4s ease;
    }}

    /* Default Dark Mode if system prefers */
    @media (prefers-color-scheme: dark) {{
      .theme-vars {{
        --bg-color: #0b120f; --text-main: #f0f4f1; --text-muted: #94a39b;
        --card-bg: rgba(30, 38, 33, 0.7); --card-border: rgba(255, 255, 255, 0.05);
        --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); --accent: #8eb392;
        --pill-bg: rgba(40, 48, 43, 0.8); --bg-img: url(data:image/jpeg;base64,{dark_b64});
      }}
    }}

    /* Manual Dark Mode Override via Checkbox */
    #theme-toggle:checked ~ .theme-vars {{
        --bg-color: #0b120f; --text-main: #f0f4f1; --text-muted: #94a39b;
        --card-bg: rgba(30, 38, 33, 0.7); --card-border: rgba(255, 255, 255, 0.05);
        --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); --accent: #8eb392;
        --pill-bg: rgba(40, 48, 43, 0.8); --bg-img: url(data:image/jpeg;base64,{dark_b64});
    }}

    .background-wrapper {{
      position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;
      background-color: var(--bg-color); background-image: var(--bg-img);
      background-size: cover; background-position: center; transition: background-image 0.5s ease;
    }}

    .ui-layer {{
      position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10;
      display: flex; flex-direction: column; justify-content: space-between; padding: 30px; color: var(--text-main);
    }}

    .glass-card {{
      background: var(--card-bg); backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
      border: 1px solid var(--card-border); border-radius: 24px; box-shadow: var(--card-shadow);
    }}

    /* Top Bar */
    .top-bar {{ display: flex; justify-content: space-between; }}
    .theme-btn-label {{
      background: var(--pill-bg); backdrop-filter: var(--blur); padding: 12px; border-radius: 50%;
      width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; cursor: pointer; border: 1px solid var(--card-border);
    }}
    .greeting {{ background: var(--pill-bg); padding: 10px 20px; border-radius: 40px; border: 1px solid var(--card-border); font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 8px; backdrop-filter: var(--blur); }}

    /* Center */
    .center-content {{ flex: 1; display: flex; justify-content: center; align-items: center; padding-bottom: 5vh; }}
    .main-widget {{ padding: 40px 50px; display: flex; flex-direction: column; align-items: center; gap: 30px; width: 100%; max-width: 500px; }}
    .title-area h1 {{ font-size: 3rem; font-weight: 700; letter-spacing: -1px; }}
    .title-area p {{ font-size: 1.1rem; color: var(--text-muted); margin-top: 5px; text-align: center; }}

    /* Search Engines CSS logic */
    .search-engines {{ display: flex; gap: 10px; margin-bottom: -15px; }}
    .search-engines label {{ padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid transparent; color: var(--text-muted); transition: 0.2s; }}
    .search-engines label:hover {{ background: rgba(255,255,255,0.1); }}
    
    input[name="engine"] {{ display: none; }}
    
    #engine-gg:checked ~ .ui-layer .search-engines label[for="engine-gg"],
    #engine-ddg:checked ~ .ui-layer .search-engines label[for="engine-ddg"],
    #engine-yt:checked ~ .ui-layer .search-engines label[for="engine-yt"] {{
      background: var(--pill-bg); color: var(--text-main); border-color: var(--card-border); box-shadow: var(--card-shadow);
    }}

    .form-container {{ width: 100%; position: relative; }}
    .search-form {{ width: 100%; display: none; position: relative; }}
    
    #engine-gg:checked ~ .ui-layer .form-container #form-gg,
    #engine-ddg:checked ~ .ui-layer .form-container #form-ddg,
    #engine-yt:checked ~ .ui-layer .form-container #form-yt {{
      display: block;
    }}

    .search-icon {{ position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }}
    .search-input {{ width: 100%; padding: 18px 20px 18px 50px; border-radius: 30px; border: 1px solid var(--card-border); background: rgba(255, 255, 255, 0.3); color: var(--text-main); font-size: 16px; outline: none; }}
    .theme-vars[data-theme="dark"] .search-input {{ background: rgba(0,0,0,0.2); }}
    .search-input:focus {{ border-color: var(--accent); background: var(--pill-bg); }}
    .search-input::placeholder {{ color: var(--text-muted); }}

    /* Dock */
    .bottom-dock-container {{ display: flex; justify-content: center; padding-bottom: 20px; }}
    .dock {{ display: flex; gap: 15px; padding: 15px 25px; border-radius: 35px; }}
    .dock-item {{ display: flex; flex-direction: column; align-items: center; gap: 6px; text-decoration: none; color: var(--text-main); padding: 10px; border-radius: 16px; min-width: 70px; transition: 0.2s; }}
    .dock-item:hover {{ background: rgba(255, 255, 255, 0.2); transform: translateY(-5px); }}
    .icon-wrapper {{ width: 46px; height: 46px; border-radius: 14px; display: flex; justify-content: center; align-items: center; background: rgba(255,255,255,0.4); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }}
    .dock-item span {{ font-size: 12px; font-weight: 500; opacity: 0.8; }}
  </style>
</head>
<body>
  
  <!-- CSS Logic Inputs at top level -->
  <input type="checkbox" id="theme-toggle">
  <input type="radio" name="engine" id="engine-gg" checked>
  <input type="radio" name="engine" id="engine-ddg">
  <input type="radio" name="engine" id="engine-yt">

  <div class="theme-vars">
    <div class="background-wrapper"></div>
    
    <div class="ui-layer">
      <header class="top-bar">
        <label for="theme-toggle" class="theme-btn-label" title="Toggle Theme (CSS Only)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </label>
        <div class="greeting">
          {svgs['google']} <span>Welcome Back</span>
        </div>
      </header>

      <main class="center-content">
        <div class="glass-card main-widget">
          <div class="title-area">
            <h1>Start Exploring</h1>
            <p>Where to next?</p>
          </div>
          
          <div class="search-engines">
            <label for="engine-gg">Google</label>
            <label for="engine-ddg">DuckDuckGo</label>
            <label for="engine-yt">YouTube</label>
          </div>

          <div class="form-container">
            <!-- Google Form -->
            <form action="https://www.google.com/search" method="GET" id="form-gg" class="search-form">
              <div class="search-icon">{svgs['search']}</div>
              <input type="text" name="q" class="search-input" placeholder="Search Google..." autocomplete="off" autofocus>
            </form>

            <!-- DuckDuckGo Form -->
            <form action="https://duckduckgo.com/" method="GET" id="form-ddg" class="search-form">
              <div class="search-icon">{svgs['search']}</div>
              <input type="text" name="q" class="search-input" placeholder="Search DuckDuckGo..." autocomplete="off">
            </form>

            <!-- YouTube Form -->
            <form action="https://www.youtube.com/results" method="GET" id="form-yt" class="search-form">
              <div class="search-icon">{svgs['search']}</div>
              <input type="text" name="search_query" class="search-input" placeholder="Search YouTube..." autocomplete="off">
            </form>
          </div>
        </div>
      </main>

      <footer class="bottom-dock-container">
        <div class="dock glass-card">
          <a href="https://github.com" class="dock-item"><div class="icon-wrapper">{svgs['github']}</div><span>GitHub</span></a>
          <a href="https://youtube.com" class="dock-item"><div class="icon-wrapper">{svgs['youtube']}</div><span>YouTube</span></a>
          <a href="https://reddit.com" class="dock-item"><div class="icon-wrapper">{svgs['reddit']}</div><span>Reddit</span></a>
          <a href="https://mail.google.com" class="dock-item"><div class="icon-wrapper">{svgs['mail']}</div><span>Mail</span></a>
        </div>
      </footer>
    </div>
  </div>

</body>
</html>
"""

with open("index.html", "w") as f:
    f.write(html)
