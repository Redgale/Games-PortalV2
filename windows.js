// Instead of re-rendering all, create elements for each window only once.
// Only update their position/style/class as needed.

window.DesktopWindows = [];
let windowCounter = 0;

function createWindow({title, content, appId}) {
  const id = windowCounter++;
  const win = {
    id, title, appId, minimized: false, maximized: false, active: true,
    x: 70 + Math.random()*160, y: 60 + Math.random()*80, width: 520, height: 340, z: 10 + id,
    el: null // reference to DOM element
  };
  DesktopWindows.push(win);
  Desktop.addWindowToDOM(win, content);
  Desktop.updateTaskbar();
  return win;
}

Desktop.addWindowToDOM = function(win, content) {
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
  header.addEventListener('mousedown', (e) => Desktop.startDrag(win.id, e));
  // Control buttons
  header.querySelectorAll('.window-control-btn')[0].onclick = (e) => { Desktop.minimizeWindow(win.id); e.stopPropagation(); };
  header.querySelectorAll('.window-control-btn')[1].onclick = (e) => { Desktop.toggleMaximizeWindow(win.id); e.stopPropagation(); };
  header.querySelectorAll('.window-control-btn')[2].onclick = (e) => { Desktop.closeWindow(win.id); e.stopPropagation(); };

  winDiv.appendChild(header);

  // content
  const contentDiv = document.createElement('div');
  contentDiv.className = 'window-content';
  contentDiv.innerHTML = content;
  winDiv.appendChild(contentDiv);

  // Click to focus
  winDiv.onclick = (e) => { Desktop.focusWindow(win.id); };

  win.el = winDiv;
  desktop.appendChild(winDiv);

  Desktop.updateWindowStyles(win);
};

Desktop.updateWindowStyles = function(win) {
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
  // If maximized, fill desktop area
  if (win.maximized) {
    win.el.style.left = '0px';
    win.el.style.top = '0px';
    win.el.style.width = Desktop.getDesktopWidth() + 'px';
    win.el.style.height = Desktop.getDesktopHeight() + 'px';
  }
};

Desktop.minimizeWindow = function(id) {
  const win = DesktopWindows.find(w => w.id === id);
  if (win) {
    win.minimized = true;
    Desktop.updateWindowStyles(win);
    Desktop.updateTaskbar();
  }
};

Desktop.toggleMaximizeWindow = function(id) {
  const win = DesktopWindows.find(w => w.id === id);
  if (win) {
    win.maximized = !win.maximized;
    Desktop.updateWindowStyles(win);
    Desktop.updateTaskbar();
  }
};

Desktop.closeWindow = function(id) {
  const idx = DesktopWindows.findIndex(w => w.id === id);
  if (idx >= 0) {
    const win = DesktopWindows[idx];
    if (win.el) win.el.remove();
    DesktopWindows.splice(idx, 1);
    Desktop.updateTaskbar();
  }
};

Desktop.focusWindow = function(id) {
  DesktopWindows.forEach(w => w.active = false);
  const win = DesktopWindows.find(w => w.id === id);
  if (win) {
    win.active = true;
    win.z = Math.max(...DesktopWindows.map(w => w.z)) + 1;
    Desktop.updateWindowStyles(win);
    Desktop.updateTaskbar();
  }
};

Desktop.startDrag = function(id, event) {
  const win = DesktopWindows.find(w => w.id === id);
  if (!win || win.maximized || win.minimized) return;
  Desktop.focusWindow(id);
  let startX = event.clientX, startY = event.clientY;
  let origX = win.x, origY = win.y;
  function onMove(e) {
    let newX = origX + (e.clientX - startX);
    let newY = origY + (e.clientY - startY);
    const maxX = Desktop.getDesktopWidth() - win.width;
    const maxY = Desktop.getDesktopHeight() - win.height;
    win.x = Math.max(0, Math.min(newX, maxX));
    win.y = Math.max(0, Math.min(newY, maxY));
    Desktop.updateWindowStyles(win);
  }
  function onUp() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  }
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
};

Desktop.updateTaskbar = function() {
  // Only shows taskbar buttons for open windows
  const container = document.getElementById('taskbar-windows');
  container.innerHTML = '';
  DesktopWindows.forEach(win => {
    const btn = document.createElement('button');
    btn.className = 'taskbar-window-btn' + (win.active ? ' active' : '');
    btn.innerText = win.title;
    btn.onclick = () => {
      if (win.minimized) {
        win.minimized = false;
        Desktop.updateWindowStyles(win);
      }
      Desktop.focusWindow(win.id);
    };
    container.appendChild(btn);
  });
};

Desktop.getDesktopWidth = function() {
  let desktop = document.getElementById('desktop');
  return desktop ? desktop.offsetWidth : window.innerWidth;
};
Desktop.getDesktopHeight = function() {
  let desktop = document.getElementById('desktop');
  return desktop ? desktop.offsetHeight : window.innerHeight - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height'));
};
