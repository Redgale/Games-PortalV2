// Desktop shell: handles wallpaper, spawning windows, desktop context menu, drag/drop, shortcuts

window.Desktop = {
  wallpaper: localStorage.getItem('wallpaper') || getComputedStyle(document.documentElement).getPropertyValue('--wallpaper'),
  windows: [],
  runningApps: {},
  init() {
    document.getElementById('desktop-bg').style.backgroundImage = this.wallpaper;
    document.getElementById('desktop-bg').addEventListener('contextmenu', this.showContextMenu.bind(this));
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleShortcut.bind(this));
    // Drag-and-drop, boot apps, window logic
    // Register all app launchers and icons here
    this.spawnApp('fetcher'); // Example: open browser on boot
  },
  setWallpaper(url) {
    this.wallpaper = `url('${url}')`;
    document.getElementById('desktop-bg').style.backgroundImage = this.wallpaper;
    localStorage.setItem('wallpaper', this.wallpaper);
  },
  showContextMenu(e) {
    e.preventDefault();
    ContextMenu.show([
      {label: 'Change Wallpaper', action: () => Apps.settings.open()},
      {label: 'New Note', action: () => Apps.texteditor.open()},
    ], e.pageX, e.pageY);
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
