// Window management logic - improved

window.DesktopWindows = [];
let windowCounter = 0;

function newWindow({title, content, appId}) {
  const id = windowCounter++;
  const win = {
    id,
    title,
    appId,
    content,
    minimized: false,
    maximized: false,
    active: true,
    // Default position and size
    x: 70 + Math.random()*160,
    y: 60 + Math.random()*80,
    width: 520,
    height: 340,
    z: 10 + id,
    // Save last position/size for restore
    last: {}
  };
  DesktopWindows.push(win);
  Desktop.renderWindows();
  return win;
}

function closeWindow(id) {
  DesktopWindows = DesktopWindows.filter(win => win.id !== id);
  Desktop.renderWindows();
}

function minimizeWindow(id) {
  const win = DesktopWindows.find(w => w.id === id);
  if (win) {
    win.minimized = true;
    win.active = false;
    Desktop.renderWindows();
  }
}

function maximizeWindow(id) {
  const win = DesktopWindows.find(w => w.id === id);
  if (win && !win.maximized) {
    // Save last position/size
    win.last = {x: win.x, y: win.y, width: win.width, height: win.height};
    win.maximized = true;
    win.x = 0;
    win.y = 0;
    win.width = Desktop.getDesktopWidth();
    win.height = Desktop.getDesktopHeight();
    win.active = true;
    win.minimized = false;
    Desktop.renderWindows();
  }
}

function restoreWindow(id) {
  const win = DesktopWindows.find(w => w.id === id);
  if (win && win.maximized) {
    win.maximized = false;
    if (win.last) {
      win.x = win.last.x;
      win.y = win.last.y;
      win.width = win.last.width;
      win.height = win.last.height;
    }
    win.active = true;
    win.minimized = false;
    Desktop.renderWindows();
  }
}

function toggleMaximizeWindow(id) {
  const win = DesktopWindows.find(w => w.id === id);
  if (win) {
    if (win.maximized) restoreWindow(id);
    else maximizeWindow(id);
  }
}

function focusWindow(id) {
  DesktopWindows.forEach(w => w.active = false);
  const win = DesktopWindows.find(w => w.id === id);
  if (win) {
    win.active = true;
    win.minimized = false;
    win.z = Math.max(...DesktopWindows.map(w => w.z)) + 1;
    Desktop.renderWindows();
  }
}

function restoreMinimizedWindow(id) {
  const win = DesktopWindows.find(w => w.id === id);
  if (win) {
    win.minimized = false;
    win.active = true;
    win.z = Math.max(...DesktopWindows.map(w => w.z)) + 1;
    Desktop.renderWindows();
  }
}

// Improved drag logic
function startDrag(id, event) {
  event.preventDefault();
  const win = DesktopWindows.find(w => w.id === id);
  if (!win || win.maximized || win.minimized) return;
  focusWindow(id);
  let startX = event.clientX, startY = event.clientY;
  let origX = win.x, origY = win.y;
  function onMove(e) {
    let newX = origX + (e.clientX - startX);
    let newY = origY + (e.clientY - startY);
    // Keep inside desktop
    const maxX = Desktop.getDesktopWidth() - win.width;
    const maxY = Desktop.getDesktopHeight() - win.height;
    win.x = Math.max(0, Math.min(newX, maxX));
    win.y = Math.max(0, Math.min(newY, maxY));
    Desktop.renderWindows();
  }
  function onUp() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  }
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}
