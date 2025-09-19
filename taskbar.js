// Taskbar: pinned apps, start menu/app launcher

window.Taskbar = {
  pinned: ['fetcher', 'texteditor', 'calculator', 'settings', 'terminal', 'fileexplorer', 'games', 'executor'],
  running: [],
  init() {
    const bar = document.getElementById('taskbar');
    bar.className = 'taskbar';
    bar.innerHTML = `
      <button class="taskbar-start" id="taskbar-start-btn">Red OS</button>
      <div class="taskbar-apps"></div>
    `;
    this.renderApps();
    setTimeout(() => {
      const btn = document.getElementById('taskbar-start-btn');
      if (btn) btn.onclick = () => Taskbar.openLauncher();
    }, 10);
  },
  renderApps() {
    const appsDiv = document.querySelector('.taskbar-apps');
    appsDiv.innerHTML = '';
    this.pinned.forEach(appId => {
      if (!window.Apps[appId]) return;
      const btn = document.createElement('button');
      btn.className = 'taskbar-app' + (Taskbar.running.includes(appId) ? ' running' : '');
      btn.innerHTML = window.Apps[appId].icon || '🗔';
      btn.title = window.Apps[appId].title;
      btn.onclick = () => window.Apps[appId].open();
      appsDiv.appendChild(btn);
    });
  },
  openLauncher() {
    ContextMenu.show(
      Object.values(window.Apps).map(app => ({
        label: app.title,
        icon: app.icon,
        action: () => app.open()
      })),
      80,
      window.innerHeight - 55
    );
  }
};

document.addEventListener('DOMContentLoaded', () => Taskbar.init());
