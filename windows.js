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
    x: 70 + Math.random()*160,
    y: 60 + Math.random()*80,
    width: 520,
    height: 340,
    z: 10 + id,
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
  if (win) win.minimized = true;
  Desktop.renderWindows();
}

function toggleMaximizeWindow(id) {
  const win = DesktopWindows.find(w => w.id === id);
  if (win) win.maximized = !win.maximized;
  Desktop.renderWindows();
}

function focusWindow(id) {
  DesktopWindows.forEach(w => w.active = false);
  const win = DesktopWindows.find(w => w.id === id);
  if (win) {
    win.active = true;
    win.z = Math.max(...DesktopWindows.map(w => w.z)) + 1;
  }
  Desktop.renderWindows();
}

function startDrag(id, event) {
  event.preventDefault();
  const win = DesktopWindows.find(w => w.id === id);
  if (!win || win.maximized) return;
  focusWindow(id);
  let startX = event.clientX, startY = event.clientY;
  let origX = win.x, origY = win.y;
  function onMove(e) {
    win.x = origX + (e.clientX - startX);
    win.y = origY + (e.clientY - startY);
    Desktop.renderWindows();
  }
  function onUp() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  }
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}
