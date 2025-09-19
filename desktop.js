// Persistent Content Switcher - No Micro Reloads, Ever

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

// Each app/tab keeps its persistent DOM node
const persistentNodes = {
  home: makeHomeNode(),
  games: makeGamesNode(),
  fetcher: makeFetcherNode(),
  executor: makeExecutorNode()
};

// Track open game windows and their nodes, so you can open as many as you want
const gameWindows = [];
let currentApp = "home"; // default

const windowContainer = document.getElementById("window-container");
const taskbarWindows = document.getElementById("taskbar-windows");

// Switch to an app/tab or game window
function showWindow(appId, node) {
  while (windowContainer.firstChild) windowContainer.removeChild(windowContainer.firstChild);
  windowContainer.appendChild(node);
  currentApp = appId;
  updateTaskbar();
}

// Start menu logic
const DesktopApps = [
  { id: 'home', title: 'Home/About', icon: '🏠' },
  { id: 'games', title: 'Games', icon: '🎮' },
  { id: 'fetcher', title: 'Website Fetcher', icon: '🌐' },
  { id: 'executor', title: 'HTML Executor', icon: '⚡' },
];

function showStartMenu() {
  const menu = document.getElementById('start-menu');
  menu.innerHTML = DesktopApps.map(app =>
    `<button class="start-menu-app-btn" data-appid="${app.id}">
      ${app.icon ? `<span style="font-size:1.05em; margin-right:0.4em;">${app.icon}</span>` : ''}
      ${app.title}
    </button>`
  ).join('');
  menu.style.display = "flex";
  Array.from(menu.querySelectorAll('.start-menu-app-btn')).forEach(btn => {
    btn.onclick = () => {
      showWindow(btn.getAttribute('data-appid'), persistentNodes[btn.getAttribute('data-appid')]);
      hideStartMenu();
    };
  });
}
function hideStartMenu() {
  document.getElementById('start-menu').style.display = "none";
}

// Taskbar
function updateTaskbar() {
  taskbarWindows.innerHTML = "";
  // Show native apps
  DesktopApps.forEach(app => {
    const btn = document.createElement('button');
    btn.className = 'taskbar-window-btn' + (currentApp === app.id ? ' active' : '');
    btn.innerText = app.title;
    btn.onclick = () => showWindow(app.id, persistentNodes[app.id]);
    taskbarWindows.appendChild(btn);
  });
  // Show open game windows
  gameWindows.forEach((gw, i) => {
    const btn = document.createElement('button');
    btn.className = 'taskbar-window-btn' + (currentApp === gw.id ? ' active' : '');
    btn.innerText = gw.title;
    btn.onclick = () => showWindow(gw.id, gw.node);
    taskbarWindows.appendChild(btn);
  });
}

// App Node Factories (persistent and interactive)
function makeHomeNode() {
  const div = document.createElement('div');
  div.innerHTML = `
    <h2>Welcome to Red Portal Desktop</h2>
    <p>
      This is a desktop-inspired web portal.<br>
      Use the start button (bottom left) to open apps.<br>
      Apps open in windows/tabs, which you can switch in the taskbar.<br>
      <b>No micro reloads: tabs/games never reload!</b>
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
  return div;
}

function makeGamesNode() {
  const div = document.createElement('div');
  div.innerHTML = `<h2>Game Library</h2>
    <div class="game-btns"></div>
    <p style="margin-top:2rem;opacity:0.8"><em>Enjoy your games! 😋</em></p>`;
  const btns = div.querySelector('.game-btns');
  GameList.forEach(game => {
    const btn = document.createElement('button');
    btn.className = 'game-btn';
    btn.innerText = game.name;
    btn.onclick = () => openGameWindow(game.url, game.name);
    btns.appendChild(btn);
  });
  return div;
}

function openGameWindow(url, name) {
  // Persistent iframe node for each game window
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style = "border:none;width:100%;height:100%;background:#151515";
  const gw = { id: "game-" + Date.now() + Math.random(), title: name, node: iframe };
  gameWindows.push(gw);
  showWindow(gw.id, gw.node);
  updateTaskbar();
}

function makeFetcherNode() {
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
  return div;
}

function makeExecutorNode() {
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
  return div;
}

// Fullscreen logic
document.getElementById('fullscreen-btn').onclick = function() {
  const wrapper = document.getElementById('desktop-wrapper');
  if (!document.fullscreenElement) wrapper.requestFullscreen?.();
  else document.exitFullscreen?.();
};

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

// Initial state: show home
showWindow('home', persistentNodes['home']);
updateTaskbar();
