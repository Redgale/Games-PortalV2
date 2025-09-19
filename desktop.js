// Desktop shell: right-click menu with all apps/pages, wallpaper, window spawning, shortcuts

window.Desktop = {
  wallpaper: localStorage.getItem('wallpaper') || getComputedStyle(document.documentElement).getPropertyValue('--wallpaper'),
  windows: [],
  runningApps: {},
  init() {
    document.getElementById('desktop-bg').style.backgroundImage = this.wallpaper;

    document.getElementById('desktop-bg').addEventListener('contextmenu', this.showContextMenu.bind(this));

    document.addEventListener('keydown', this.handleShortcut.bind(this));

    document.body.addEventListener('contextmenu', function(e) {
      if (e.target.id === 'desktop-bg' || e.target.id === 'desktop') e.preventDefault();
    });
  },
  setWallpaper(url) {
    this.wallpaper = `url('${url}')`;
    document.getElementById('desktop-bg').style.backgroundImage = this.wallpaper;
    localStorage.setItem('wallpaper', this.wallpaper);
  },
  showContextMenu(e) {
    e.preventDefault();
    const items = Object.values(window.Apps).map(app => ({
      label: app.title,
      icon: app.icon,
      action: () => app.open()
    }));
    items.unshift({label: 'Change Wallpaper', icon: '🖼️', action: () => window.Apps.settings.open()});
    ContextMenu.show(items, e.pageX, e.pageY);
  },
  spawnApp(appId, opts={}) {
    if (window.Apps[appId]) window.Apps[appId].open(opts);
  },
  handleShortcut(e) {
    if (e.altKey && e.key === 'Tab') {
      WindowManager.focusNext();
    }
    if (e.ctrlKey && e.key === 'n') {
      window.Apps.texteditor.open();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Desktop.init());
