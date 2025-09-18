// UI component generators - improved

function createStartMenu(apps) {
  return apps.map(app =>
    `<button class="start-menu-app-btn" onclick="Desktop.openAppWindow('${app.id}')">
      ${app.icon ? `<span style="font-size:1.05em; margin-right:0.4em;">${app.icon}</span>` : ''}
      ${app.title}
    </button>`
  ).join('');
}

function createTaskbarWindowBtn(win) {
  return `<button class="taskbar-window-btn${win.active ? ' active' : ''}"
    onclick="Desktop.onTaskbarWindowClick(${win.id})">${win.title}</button>`;
}

function createWindowHeader(win) {
  return `<div class="window-header" onmousedown="Desktop.startDrag(${win.id}, event)">
    <span class="window-title">${win.title}</span>
    <div class="window-controls">
      <button class="window-control-btn" title="Minimize" onclick="Desktop.minimizeWindow(${win.id});event.stopPropagation();">—</button>
      <button class="window-control-btn" title="Maximize/Restore" onclick="Desktop.toggleMaximizeWindow(${win.id});event.stopPropagation();">${win.maximized ? '🗗' : '⛶'}</button>
      <button class="window-control-btn" title="Close" onclick="Desktop.closeWindow(${win.id});event.stopPropagation();">✕</button>
    </div>
  </div>`;
}
