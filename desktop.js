// Red Portal Desktop - micro reloads fixed with persistent DOM

const DesktopApps = [
  { id: 'home', title: 'Home/About', icon: '🏠', appFn: renderHomeApp },
  { id: 'games', title: 'Games', icon: '🎮', appFn: renderGamesApp },
  { id: 'fetcher', title: 'Website Fetcher', icon: '🌐', appFn: renderFetcherApp },
  { id: 'executor', title: 'HTML Executor', icon: '⚡', appFn: renderExecutorApp },
];

const GameList = [
  { name: "Cookie Clicker", url: "https://cookieclicker-nu.vercel.app" },
  { name: "Drive Mad", url: "https://drive-mad1.vercel.app" },
  { name: "Eaglercraft 1.8", url: "https://eagler1-8-8-wasm-gc.vercel.app" },
  { name: "Eaglercraft 1.12", url: "https://math-class-school.vercel.app" },
  { name: "House of Hazards", url: "https://house-of-hazards-ashy.vercel.app" },
  { name: "Dadish 1", url: "https://dadish.vercel.app" },
  { name: "Bad Monday Sim", url: "https://badmondaysim.vercel.app/" },
  { name: "Dadish 2", url: "https://dadish2.vercel.app/" },
  { name: "Stickman Hook", url: "https://stickman-hook-five.vercel.app" },
  { name: "Bitlife", url: "https://bitlife1.vercel.app" },
  { name: "Compact Conflict", url: "https://wasyl.eu/games/compact-conflict/play.html" },
];

let DesktopWindows = [];
let windowCounter = 0;
let dragInfo = null;
let isFullscreen = false;

function createAppWindow({title, content, appId}) {
  const id = windowCounter++;
  const win = {
    id, title, appId, minimized: false, maximized: false, active: true,
    x: 70 + Math.random()*160, y: 60 + Math.random()*80, width: 520, height: 340, z: 10 + id,
    el: null // reference to DOM element
  };
  DesktopWindows.push(win);
  addWindowToDOM(win, content);
  updateTaskbar();
  return win;
}

function addWindowToDOM(win, content) {
  const desktop = document.getElementById('desktop');
  const winDiv = document.createElement('div');
  winDiv.className = 'window';
  winDiv.style.left = win.x + 'px';
  winDiv.style.top = win.y + 'px';
  winDiv.style.width = win.width + 'px';
  winDiv.style.height = win.height + 'px';
  winDiv.style.zIndex = win.z;
  winDiv.dataset.winId = win.id;

  // header
  const header = document.createElement('div');
  header.className = 'window-header';
  header.innerHTML = `
    <span class="window-title">${win.title}</span>
    <div class="window-controls">
      <button class="window-control-btn" title="Minimize">—</button>
      <button class="window-control-btn" title="Maximize/Restore">⛶</button>
      <button class="window-control-btn" title="Close">✕</button>
    </div>
  `;
  // Drag logic
  header.addEventListener('mousedown', (e) => startDrag(win.id, e));
  // Control buttons
  header.querySelectorAll('.window-control-btn')[0].onclick = (e) => { minimizeWindow(win.id); e.stopPropagation(); };
  header.querySelectorAll('.window-control-btn')[1].onclick = (e) => { toggleMaximizeWindow(win.id); e.stopPropagation(); };
  header.querySelectorAll('.window-control-btn')[2].onclick = (e) => { closeWindow(win.id); e.stopPropagation(); };

  winDiv.appendChild(header);

  // content
  const contentDiv = document.createElement('div');
  contentDiv.className = 'window-content';
  // Instead of innerHTML, use appendChild for persistent DOM
  if (typeof content === "string") {
    // If content is HTML string, convert to nodes
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    while (tempDiv.firstChild) contentDiv.appendChild(tempDiv.firstChild);
  } else {
    // If content is already a DOM node (iframe, textarea, etc), append directly
    contentDiv.appendChild(content);
  }
  winDiv.appendChild(contentDiv);

  // Click to focus
  winDiv.onclick = (e) => { focusWindow(win.id); };

  win.el = winDiv;
  desktop.appendChild(winDiv);

  updateWindowStyles(win);
}

function updateWindowStyles(win) {
  if (!win.el) return;
  win.el.style.left = win.x + 'px';
  win.el.style.top = win.y + 'px';
  win.el.style.width = win.width + 'px';
  win.el.style.height = win.height + 'px';
  win.el.style.zIndex = win.z;
  win.el.classList.toggle('minimized', win.minimized);
  win.el.classList.toggle('maximized', win.maximized);
  win.el.classList.toggle('active', win.active);
  win.el.style.display = win.minimized ? 'none' : '';
  if (win.maximized) {
    win.el.style.left = '0px';
    win.el.style.top = '0px';
    win.el.style.width = getDesktopWidth() + 'px';
    win.el.style.height = getDesktopHeight() + 'px';
  }
}

function minimizeWindow(id) {
  const win = DesktopWindows.find(w => w.id === id);
  if (win) {
    win.minimized = true;
    updateWindowStyles(win);
    updateTaskbar();
  }
}

function toggleMaximizeWindow(id) {
  const win = DesktopWindows.find(w => w.id === id);
  if (win) {
    win.maximized = !win.maximized;
    updateWindowStyles(win);
    updateTaskbar();
  }
}

function closeWindow(id) {
  const idx = DesktopWindows.findIndex(w => w.id === id);
  if (idx >= 0) {
    const win = DesktopWindows[idx];
    if (win.el) win.el.remove();
    DesktopWindows.splice(idx, 1);
    updateTaskbar();
  }
}

function focusWindow(id) {
  DesktopWindows.forEach(w => w.active = false);
  const win = DesktopWindows.find(w => w.id === id);
  if (win) {
    win.active = true;
    win.minimized = false;
    win.z = Math.max(...DesktopWindows.map(w => w.z)) + 1;
    updateWindowStyles(win);
    updateTaskbar();
  }
}

function startDrag(id, event) {
  const win = DesktopWindows.find(w => w.id === id);
  if (!win || win.maximized || win.minimized) return;
  focusWindow(id);
  dragInfo = {
    win,
    startX: event.clientX,
    startY: event.clientY,
    origX: win.x,
    origY: win.y
  };
  window.addEventListener('mousemove', dragMove);
  window.addEventListener('mouseup', dragEnd);
}

function dragMove(e) {
  if (!dragInfo) return;
  let newX = dragInfo.origX + (e.clientX - dragInfo.startX);
  let newY = dragInfo.origY + (e.clientY - dragInfo.startY);
  const maxX = getDesktopWidth() - dragInfo.win.width;
  const maxY = getDesktopHeight() - dragInfo.win.height;
  dragInfo.win.x = Math.max(0, Math.min(newX, maxX));
  dragInfo.win.y = Math.max(0, Math.min(newY, maxY));
  updateWindowStyles(dragInfo.win);
}

function dragEnd() {
  window.removeEventListener('mousemove', dragMove);
  window.removeEventListener('mouseup', dragEnd);
  dragInfo = null;
}

function updateTaskbar() {
  const container = document.getElementById('taskbar-windows');
  container.innerHTML = '';
  DesktopWindows.forEach(win => {
    const btn = document.createElement('button');
    btn.className = 'taskbar-window-btn' + (win.active ? ' active' : '');
    btn.innerText = win.title;
    btn.onclick = () => {
      if (win.minimized) {
        win.minimized = false;
        updateWindowStyles(win);
      }
      focusWindow(win.id);
    };
    container.appendChild(btn);
  });
}

function getDesktopWidth() {
  let desktop = document.getElementById('desktop');
  return desktop ? desktop.offsetWidth : window.innerWidth;
}
function getDesktopHeight() {
  let desktop = document.getElementById('desktop');
  return desktop ? desktop.offsetHeight : window.innerHeight - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height'));
}

// Start menu logic
function showStartMenu() {
  const menu = document.getElementById('start-menu');
  menu.innerHTML = DesktopApps.map(app =>
    `<button class="start-menu-app-btn" onclick="openAppWindow('${app.id}')">
      ${app.icon ? `<span style="font-size:1.05em; margin-right:0.4em;">${app.icon}</span>` : ''}
      ${app.title}
    </button>`
  ).join('');
  menu.style.display = "flex";
}
function hideStartMenu() {
  document.getElementById('start-menu').style.display = "none";
}
window.openAppWindow = function(appId) {
  const app = DesktopApps.find(a => a.id === appId);
  if (!app) return;
  let content;
  if (app.id === "games") {
    // Games: persistent buttons, launch games in windows
    const div = document.createElement('div');
    div.innerHTML = `<h2>Game Library</h2>
    <div class="game-btns"></div>
    <p style="margin-top:2rem;opacity:0.8"><em>Enjoy your games! 😋</em></p>`;
    const btns = div.querySelector('.game-btns');
    GameList.forEach(game => {
      const btn = document.createElement('button');
      btn.className = 'game-btn';
      btn.innerText = game.name;
      btn.onclick = () => {
        openGameWindow(game.url, game.name);
      };
      btns.appendChild(btn);
    });
    content = div;
  } else if (app.id === "fetcher") {
    // Website Fetcher: persistent form
    const div = document.createElement('div');
    div.innerHTML = `<h2>Website Fetcher</h2>
      <form class="fletcher-box">
        <input type="url" placeholder="Enter a website link here..." required />
        <button type="submit">Fetch & Open</button>
      </form>
      <p class="fetcher-status" style="margin-top:1rem;color:var(--accent);"></p>`;
    const form = div.querySelector('form');
    const status = div.querySelector('.fetcher-status');
    form.onsubmit = (e) => {
      e.preventDefault();
      let url = form.querySelector('input').value.trim();
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      status.textContent = "Opening website in a window...";
      openGameWindow(url, url);
      form.querySelector('input').value = '';
      setTimeout(()=>{status.textContent = "";}, 1800);
    };
    content = div;
  } else if (app.id === "executor") {
    // HTML Executor: persistent textarea/form
    const div = document.createElement('div');
    div.innerHTML = `<h2>HTML Executor</h2>
      <div class="executor-box">
        <label>Type HTML to execute:</label>
        <textarea placeholder="Type or paste your HTML, JS, or CSS here..."></textarea>
        <button>Execute Typed HTML</button>
        <label>Or upload a file to execute as HTML:</label>
        <input type="file" accept="*/*">
        <button>Execute Uploaded File</button>
        <span class="executor-status" style="color:var(--accent);margin-top:5px;"></span>
      </div>`;
    const box = div.querySelector('.executor-box');
    const textarea = box.querySelector('textarea');
    const executeBtn = box.querySelectorAll('button')[0];
    const fileInput = box.querySelector('input[type="file"]');
    const fileBtn = box.querySelectorAll('button')[1];
    const status = box.querySelector('.executor-status');
    executeBtn.onclick = () => {
      if (!textarea.value.trim()) {
        status.textContent = "Please enter HTML or code to execute.";
        return;
      }
      openGameWindow("data:text/html," + encodeURIComponent(textarea.value), "HTML Executor");
      status.textContent = "Executed in new window.";
      setTimeout(()=>{status.textContent = "";}, 2000);
    };
    fileBtn.onclick = () => {
      const file = fileInput.files[0];
      if (!file) {
        status.textContent = "Please select a file to execute.";
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e) {
        openGameWindow("data:text/html," + encodeURIComponent(e.target.result), "HTML Executor File");
        status.textContent = "File executed in new window.";
        setTimeout(()=>{status.textContent = "";}, 2000);
      };
      reader.onerror = function() {
        status.textContent = "Failed to read file.";
      };
      reader.readAsText(file);
      fileInput.value = '';
    };
    content = div;
  } else {
    // Home/About: persistent content
    const div = document.createElement('div');
    div.innerHTML = renderHomeApp();
    content = div;
  }
  createAppWindow({
    title: app.title,
    content,
    appId: app.id
  });
  updateTaskbar();
  hideStartMenu();
}

function openGameWindow(url, name) {
  // Always create persistent iframe
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style = "border:none;width:100%;height:100%;background:#151515";
  createAppWindow({
    title: name,
    content: iframe,
    appId: 'games'
  });
}

function renderHomeApp() {
  return `
    <h2>Welcome to Red Portal Desktop</h2>
    <p>
      This is a desktop-inspired web portal.<br>
      Use the start button (bottom left) to open apps.<br>
      Apps open in windows, which you can move, minimize, maximize, or close.
    </p>
    <ul>
      <li><strong>Games:</strong> Play fun web games.</li>
      <li><strong>Website Fetcher:</strong> Open any site with fetcher (CORS required).</li>
      <li><strong>HTML Executor:</strong> Run HTML/CSS/JS in a window.</li>
    </ul>
    <p>
      <em>Try full-screen mode for a real desktop feel!</em>
    </p>
  `;
}

// Fullscreen logic
function toggleFullscreen() {
  const wrapper = document.getElementById('desktop-wrapper');
  if (!isFullscreen) {
    wrapper.requestFullscreen?.();
    isFullscreen = true;
  } else {
    document.exitFullscreen?.();
    isFullscreen = false;
  }
}
document.getElementById('fullscreen-btn').onclick = toggleFullscreen;

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Show home window at start
  openAppWindow('home');
  // Start button
  document.getElementById('start-btn').onclick = () => {
    const menu = document.getElementById('start-menu');
    if (menu.style.display === "none") showStartMenu();
    else hideStartMenu();
  };
  // Click outside start menu closes it
  document.addEventListener('mousedown', e => {
    const menu = document.getElementById('start-menu');
    if (menu.style.display !== "none" && !menu.contains(e.target) && e.target.id !== 'start-btn') {
      hideStartMenu();
    }
  });
  // Adjust windows on resize (keep inside desktop)
  window.addEventListener('resize', () => {
    DesktopWindows.forEach(win => {
      const maxX = getDesktopWidth() - win.width;
      const maxY = getDesktopHeight() - win.height;
      win.x = Math.max(0, Math.min(win.x, maxX));
      win.y = Math.max(0, Math.min(win.y, maxY));
      if (win.maximized) {
        win.x = 0;
        win.y = 0;
        win.width = getDesktopWidth();
        win.height = getDesktopHeight();
      }
      updateWindowStyles(win);
    });
  });
});
