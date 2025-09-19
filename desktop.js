// Absolutely persistent iframes/textareas. No reloads, ever.

const desktop = document.getElementById('desktop');

const windows = {
  home: createWindow('Home', makeHomeContent()),
  games: createWindow('Games', makeGamesIframe()),
  fetcher: createWindow('Fetcher', makeFetcherIframe()),
  executor: createWindow('Executor', makeExecutorIframe())
};

// Add windows to desktop
Object.values(windows).forEach(win => desktop.appendChild(win));

// Show only one window at a time
function showWindow(name) {
  Object.entries(windows).forEach(([key, win]) => {
    win.classList.toggle('active', key === name);
  });
}

// Tab buttons
document.getElementById('tab-home').onclick = () => showWindow('home');
document.getElementById('tab-games').onclick = () => showWindow('games');
document.getElementById('tab-fetcher').onclick = () => showWindow('fetcher');
document.getElementById('tab-executor').onclick = () => showWindow('executor');

// Fullscreen
document.getElementById('fullscreen-btn').onclick = () => {
  document.documentElement.requestFullscreen?.();
};

// --- Window creation functions ---
function createWindow(title, contentNode) {
  const win = document.createElement('div');
  win.className = 'window';
  win.innerHTML = `<div class="window-header">${title}</div>`;
  win.appendChild(contentNode);
  return win;
}

function makeHomeContent() {
  const div = document.createElement('div');
  div.className = 'window-content';
  div.innerHTML = `<h2>Welcome!</h2>
    <p>This portal uses persistent windows. Switch tabs—no reloads, no lost state.</p>`;
  return div;
}

function makeGamesIframe() {
  const iframe = document.createElement('iframe');
  iframe.className = 'window-iframe';
  iframe.src = "https://cookieclicker-nu.vercel.app"; // Example game, you can cycle games in this window!
  return iframe;
}

function makeFetcherIframe() {
  const iframe = document.createElement('iframe');
  iframe.className = 'window-iframe';
  iframe.src = "https://example.com"; // Or blank, and you can change src with a form
  return iframe;
}

function makeExecutorIframe() {
  const iframe = document.createElement('iframe');
  iframe.className = 'window-iframe';
  iframe.srcdoc = "<html><body style='background:#151515;color:#fff'><h2>Type HTML below</h2></body></html>";
  return iframe;
}

// Show home at first
showWindow('home');
