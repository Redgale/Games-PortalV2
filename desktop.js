// Improved Desktop Shell: Right-click context menu with all apps/pages

window.Desktop = {
  wallpaper: localStorage.getItem('wallpaper') || getComputedStyle(document.documentElement).getPropertyValue('--wallpaper'),
  windows: [],
  runningApps: {},
  init() {
    document.getElementById('desktop-bg').style.backgroundImage = this.wallpaper;
    document.getElementById('desktop-bg').addEventListener('contextmenu', this.showContextMenu.bind(this));
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleShortcut.bind(this));
    // Register all app launchers and icons here
    // Do not auto-boot any app unless desired
  },
  setWallpaper(url) {
    this.wallpaper = `url('${url}')`;
    document.getElementById('desktop-bg').style.backgroundImage = this.wallpaper;
    localStorage.setItem('wallpaper', this.wallpaper);
  },
  showContextMenu(e) {
    e.preventDefault();
    // Dynamically generate menu from all registered apps/pages
    const items = Object.values(Apps).map(app => ({
      label: app.title,
      icon: app.icon,
      action: () => app.open()
    }));
    items.unshift({label: 'Change Wallpaper', action: () => Apps.settings.open()});
    ContextMenu.show(items, e.pageX, e.pageY);
  },
  spawnApp(appId, opts={}) {
    if (Apps[appId]) Apps[appId].open(opts);
  },
  handleShortcut(e) {
    // Alt+Tab = switch window, Ctrl+N = new window (note), etc.
    if (e.altKey && e.key === 'Tab') {
      WindowManager.focusNext();
    }
    if (e.ctrlKey && e.key === 'n') {
      Apps.texteditor.open();
    }
  }
};
document.addEventListener('DOMContentLoaded', ()=>Desktop.init());
