// Window manager: creates draggable/resizable windows, window controls, z-index/focus, snapping

window.WindowManager = {
  windows: [],
  z: 100,
  create(appInfo, opts={}) {
    const win = document.createElement('div');
    win.className = 'os-window active';
    win.style.left = (opts.left || Math.random()*400+60)+'px';
    win.style.top = (opts.top || Math.random()*150+80)+'px';
    win.style.width = opts.width || '420px';
    win.style.height = opts.height || '320px';
    win.style.zIndex = ++this.z;
    win.innerHTML = `
      <div class="os-window-header">
        <span class="os-window-title">${appInfo.title}</span>
        <div class="os-window-controls">
          <button title="Minimize" onclick="WindowManager.minimize(this)">&#8211;</button>
          <button title="Maximize" onclick="WindowManager.maximize(this)">&#9723;</button>
          <button title="Close" onclick="WindowManager.close(this)">&#10006;</button>
        </div>
      </div>
      <div class="os-window-content">${appInfo.content ? appInfo.content() : ''}</div>
    `;
    document.getElementById('windows').appendChild(win);
    this.makeDraggable(win);
    this.makeResizable(win);
    this.windows.push(win);
    win.addEventListener('mousedown', ()=>this.focus(win));
    return win;
  },
  makeDraggable(win) {
    const header = win.querySelector('.os-window-header');
    let isDragging = false, offsetX=0, offsetY=0;
    header.addEventListener('mousedown', e=>{
      isDragging=true; offsetX=e.offsetX; offsetY=e.offsetY;
      win.style.zIndex = ++this.z;
      document.body.style.userSelect='none';
    });
    document.addEventListener('mousemove', e=>{
      if (isDragging) {
        win.style.left = (e.pageX-offsetX)+'px';
        win.style.top = (e.pageY-offsetY)+'px';
      }
    });
    document.addEventListener('mouseup', ()=>{isDragging=false; document.body.style.userSelect='';});
  },
  makeResizable(win) {
    win.style.resize = 'both';
  },
  focus(win) {
    // Set all windows inactive, bring this window to front
    this.windows.forEach(w=>w.classList.remove('active'));
    win.classList.add('active');
    win.style.zIndex = ++this.z;
  },
  minimize(btn) {
    const win = btn.closest('.os-window');
    win.style.display = 'none';
    // TODO: Move to taskbar minimized list
  },
  maximize(btn) {
    const win = btn.closest('.os-window');
    if (win.dataset.maximized) {
      win.style.left = win.dataset.left;
      win.style.top = win.dataset.top;
      win.style.width = win.dataset.width;
      win.style.height = win.dataset.height;
      win.dataset.maximized = '';
    } else {
      win.dataset.left = win.style.left;
      win.dataset.top = win.style.top;
      win.dataset.width = win.style.width;
      win.dataset.height = win.style.height;
      win.style.left = '0px';
      win.style.top = '0px';
      win.style.width = '98vw';
      win.style.height = '91vh';
      win.dataset.maximized = '1';
    }
  },
  close(btn) {
    const win = btn.closest('.os-window');
    win.remove();
    this.windows = this.windows.filter(w=>w!==win);
  },
  focusNext() {
    if (this.windows.length === 0) return;
    const activeIdx = this.windows.findIndex(w=>w.classList.contains('active'));
    const nextIdx = (activeIdx+1)%this.windows.length;
    this.focus(this.windows[nextIdx]);
  }
};
