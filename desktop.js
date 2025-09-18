// Desktop management - improved

const Desktop = {
  openAppWindow(appId) {
    const app = window.DesktopApps.find(a => a.id === appId);
    if (!app) return;
    newWindow({
      title: app.title,
      content: app.appFn(),
      appId: appId
    });
    Desktop.renderTaskbar();
    Desktop.hideStartMenu();
  },
  launchGameWindow(url, name) {
    // Open game in window as iframe
    newWindow({
      title: name,
      content: `<iframe src="${url}" style="border:none;width:100%;height:100%;background:#151515"></iframe>`,
      appId: 'games'
    });
    Desktop.renderTaskbar();
  },
  launchFetcherWindow(e) {
    e.preventDefault();
    const input = document.getElementById('fetcher-app-input');
    const status = document.getElementById('fetcher-app-status');
    let url = input.value.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    status.textContent = "Opening website in a window...";
    newWindow({
      title: url,
      content: `<iframe src="${url}" style="border:none;width:100%;height:100%;background:#151515"></iframe>`,
      appId: 'fetcher'
    });
    input.value = '';
    setTimeout(()=>{status.textContent = "";}, 2200);
    Desktop.renderTaskbar();
  },
  launchExecutorWindow() {
    const status = document.getElementById('executor-app-status');
    const html = document.getElementById('executor-app-text').value;
    if (!html.trim()) {
      status.textContent = "Please enter HTML or code to execute.";
      return;
    }
    newWindow({
      title: "HTML Executor",
      content: `<iframe srcdoc='${html.replace(/'/g,"&#39;")}' style="border:none;width:100%;height:100%;background:#151515"></iframe>`,
      appId: 'executor'
    });
    status.textContent = "Executed in new window.";
    setTimeout(()=>{status.textContent = "";}, 2000);
    Desktop.renderTaskbar();
  },
  launchExecutorFileWindow() {
    const status = document.getElementById('executor-app-status');
    const input = document.getElementById('executor-app-file');
    const file = input.files[0];
    if (!file) {
      status.textContent = "Please select a file to execute.";
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      newWindow({
        title: "HTML Executor File",
        content: `<iframe srcdoc='${e.target.result.replace(/'/g,"&#39;")}' style="border:none;width:100%;height:100%;background:#151515"></iframe>`,
        appId: 'executor'
      });
      status.textContent = "File executed in new window.";
      setTimeout(()=>{status.textContent = "";}, 2000);
      Desktop.renderTaskbar();
    };
    reader.onerror = function() {
      status.textContent = "Failed to read file.";
    };
    reader.readAsText(file);
    input.value = '';
  },
  renderTaskbar() {
    document.getElementById('taskbar-windows').innerHTML = DesktopWindows.map(createTaskbarWindowBtn).join('');
  },
  renderWindows() {
    const desktop = document.getElementById('desktop');
    desktop.innerHTML = DesktopWindows.map(win => `
      <div class="window${win.minimized ? ' minimized' : ''}${win.maximized ? ' maximized' : ''}"
        style="left:${win.x}px;top:${win.y}px;width:${win.width}px;height:${win.height}px;z-index:${win.z}"
        onclick="Desktop.focusWindow(${win.id})">
        ${createWindowHeader(win)}
        <div class="window-content">${win.content}</div>
      </div>
    `).join('');
    Desktop.renderTaskbar();
  },
  minimizeWindow: minimizeWindow,
  toggleMaximizeWindow: toggleMaximizeWindow,
  closeWindow: closeWindow,
  focusWindow: focusWindow,
  startDrag: startDrag,
  restoreWindow: restoreWindow,
  restoreMinimizedWindow: restoreMinimizedWindow,
  showStartMenu() {
    const menu = document.getElementById('start-menu');
    menu.innerHTML = createStartMenu(window.DesktopApps);
    menu.style.display = "flex";
  },
  hideStartMenu() {
    document.getElementById('start-menu').style.display = "none";
  },
  fullscreen: false,
  toggleFullscreen() {
    const desktop = document.getElementById('desktop');
    const taskbar = document.getElementById('taskbar');
    if (!Desktop.fullscreen) {
      // Put desktop and taskbar in a wrapper and fullscreen that
      let wrapper = document.getElementById('desktop-fullscreen-wrap');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = 'desktop-fullscreen-wrap';
        wrapper.style.position = 'fixed';
        wrapper.style.left = '0';
        wrapper.style.top = '0';
        wrapper.style.width = '100vw';
        wrapper.style.height = '100vh';
        wrapper.style.zIndex = '99999';
        document.body.appendChild(wrapper);
        wrapper.appendChild(desktop);
        wrapper.appendChild(taskbar);
      }
      wrapper.requestFullscreen?.();
      Desktop.fullscreen = true;
    } else {
      document.exitFullscreen?.();
      Desktop.fullscreen = false;
      // Move desktop and taskbar back to body
      let wrapper = document.getElementById('desktop-fullscreen-wrap');
      if (wrapper) {
        document.body.appendChild(desktop);
        document.body.appendChild(taskbar);
        wrapper.remove();
      }
    }
  },
  getDesktopWidth() {
    // Desktop width minus scrollbar
    let w = document.getElementById('desktop').offsetWidth;
    return w > 0 ? w : window.innerWidth;
  },
  getDesktopHeight() {
    let h = document.getElementById('desktop').offsetHeight;
    return h > 0 ? h : window.innerHeight - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height'));
  },
  onTaskbarWindowClick(id) {
    const win = DesktopWindows.find(w => w.id === id);
    if (!win) return;
    if (win.minimized) Desktop.restoreMinimizedWindow(id);
    else Desktop.focusWindow(id);
  }
};

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  Desktop.renderTaskbar();
  Desktop.renderWindows();
  // Start button
  document.getElementById('start-btn').onclick = () => {
    const menu = document.getElementById('start-menu');
    if (menu.style.display === "none") Desktop.showStartMenu();
    else Desktop.hideStartMenu();
  };
  // Click outside start menu closes it
  document.addEventListener('mousedown', e => {
    const menu = document.getElementById('start-menu');
    if (menu.style.display !== "none" && !menu.contains(e.target) && e.target.id !== 'start-btn') {
      Desktop.hideStartMenu();
    }
  });
  // Fullscreen button
  document.getElementById('fullscreen-btn').onclick = () => Desktop.toggleFullscreen();
  // Adjust windows on resize (keep inside desktop)
  window.addEventListener('resize', () => {
    DesktopWindows.forEach(win => {
      const maxX = Desktop.getDesktopWidth() - win.width;
      const maxY = Desktop.getDesktopHeight() - win.height;
      win.x = Math.max(0, Math.min(win.x, maxX));
      win.y = Math.max(0, Math.min(win.y, maxY));
      if (win.maximized) {
        win.x = 0;
        win.y = 0;
        win.width = Desktop.getDesktopWidth();
        win.height = Desktop.getDesktopHeight();
      }
    });
    Desktop.renderWindows();
  });
});
