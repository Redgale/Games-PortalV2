// System Tray: clock, notifications, volume, network, battery

window.Tray = {
  init() {
    const tray = document.getElementById('tray');
    tray.className = 'tray';
    tray.innerHTML = `
      <span class="tray-clock" id="tray-clock"></span>
      <span class="tray-icon" title="Volume">&#128266;</span>
      <span class="tray-icon" title="Network">&#128246;</span>
      <span class="tray-icon" title="Battery">&#128267;</span>
    `;
    this.updateClock();
    setInterval(()=>this.updateClock(), 1000);
  },
  updateClock() {
    document.getElementById('tray-clock').textContent = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }
};
document.addEventListener('DOMContentLoaded', ()=>Tray.init());
