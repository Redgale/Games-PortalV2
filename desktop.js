// Red Portal Desktop - robust window manager

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
  contentDiv.innerHTML = content;
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
  createAppWindow({
    title: app.title,
    content: app.appFn(),
    appId: appId
  });
  updateTaskbar();
  hideStartMenu();
}

// Fullscreen logic
let isFullscreen = false;
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

// App renderers
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

function renderGamesApp() {
  return `
    <h2>Game Library</h2>
    <div class="game-btns">
      ${GameList.map(game =>
        `<button class="game-btn" onclick="launchGameWindow('${game.url}', '${game.name}')">${game.name}</button>`
      ).join('')}
    </div>
    <p style="margin-top:2rem;opacity:0.8"><em>Enjoy your games! 😋</em></p>
  `;
}

window.launchGameWindow = function(url, name) {
  createAppWindow({
    title: name,
    content: `<iframe src="${url}" style="border:none;width:100%;height:100%;background:#151515"></iframe>`,
    appId: 'games'
  });
};

function renderFetcherApp() {
  return `
    <h2>Website Fetcher</h2>
    <form class="fletcher-box" onsubmit="launchFetcherWindow(event)">
      <input type="url" id="fetcher-app-input" placeholder="Enter a website link here..." required />
      <button type="submit">Fetch & Open</button>
    </form>
    <p id="fetcher-app-status" style="margin-top:1rem;color:var(--accent);"></p>
  `;
}
window.launchFetcherWindow = function(e) {
  e.preventDefault();
  const input = document.getElementById('fetcher-app-input');
  const status = document.getElementById('fetcher-app-status');
  let url = input.value.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  status.textContent = "Opening website in a window...";
  createAppWindow({
    title: url,
    content: `<iframe src="${url}" style="border:none;width:100%;height:100%;background:#151515"></iframe>`,
    appId: 'fetcher'
  });
  input.value = '';
  setTimeout(()=>{status.textContent = "";}, 1800);
};

function renderExecutorApp() {
  return `
    <h2>HTML Executor</h2>
    <div class="executor-box">
      <label for="executor-app-text">Type HTML to execute:</label>
      <textarea id="executor-app-text" placeholder="Type or paste your HTML, JS, or CSS here..."></textarea>
      <button onclick="launchExecutorWindow()">Execute Typed HTML</button>
      <label for="executor-app-file">Or upload a file to execute as HTML:</label>
      <input type="file" id="executor-app-file" accept="*/*">
      <button onclick="launchExecutorFileWindow()">Execute Uploaded File</button>
      <span id="executor-app-status" style="color:var(--accent);margin-top:5px;"></span>
    </div>
  `;
}
window.launchExecutorWindow = function() {
  const status = document.getElementById('executor-app-status');
  const html = document.getElementById('executor-app-text').value;
  if (!html.trim()) {
    status.textContent = "Please enter HTML or code to execute.";
    return;
  }
  createAppWindow({
    title: "HTML Executor",
    content: `<iframe srcdoc='${html.replace(/'/g,"&#39;")}' style="border:none;width:100%;height:100%;background:#151515"></iframe>`,
    appId: 'executor'
  });
  status.textContent = "Executed in new window.";
  setTimeout(()=>{status.textContent = "";}, 2000);
};
window.launchExecutorFileWindow = function() {
  const status = document.getElementById('executor-app-status');
  const input = document.getElementById('executor-app-file');
  const file = input.files[0];
  if (!file) {
    status.textContent = "Please select a file to execute.";
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    createAppWindow({
      title: "HTML Executor File",
      content: `<iframe srcdoc='${e.target.result.replace(/'/g,"&#39;")}' style="border:none;width:100%;height:100%;background:#151515"></iframe>`,
      appId: 'executor'
    });
    status.textContent = "File executed in new window.";
    setTimeout(()=>{status.textContent = "";}, 2000);
  };
  reader.onerror = function() {
    status.textContent = "Failed to read file.";
  };
  reader.readAsText(file);
  input.value = '';
};

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Show home window at start
  createAppWindow({
    title: DesktopApps[0].title,
    content: DesktopApps[0].appFn(),
    appId: DesktopApps[0].id
  });
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
  // Fullscreen button
  document.getElementById('fullscreen-btn').onclick = toggleFullscreen;
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
