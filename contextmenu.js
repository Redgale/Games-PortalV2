// Context menus for desktop, taskbar, windows

window.ContextMenu = {
  show(items, x, y) {
    const menu = document.getElementById('context-menu');
    menu.innerHTML = items.map(item=>
      `<div class="context-menu-item" onclick="ContextMenu.select(this,${items.indexOf(item)})">
        ${item.icon?`<span>${item.icon}</span>`:''}${item.label}
      </div>`).join('');
    menu.style.left = x+'px';
    menu.style.top = y+'px';
    menu.style.display = 'block';
    this._items = items;
  },
  select(elem, idx) {
    document.getElementById('context-menu').style.display = 'none';
    this._items[idx].action();
  }
};
document.addEventListener('click', ()=>document.getElementById('context-menu').style.display='none');
