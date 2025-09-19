// Games App: Restored original Games page logic/UI

window.Apps = window.Apps || {};
Apps.games = {
  title: 'Games',
  icon: '🎮',
  open(opts = {}) {
    WindowManager.create(this, opts);
  },
  gamesList: [
    { name: 'Cookie Clicker', url: 'https://cookieclicker-nu.vercel.app' },
    { name: 'Drive Mad', url: 'https://drive-mad1.vercel.app' },
    { name: 'Eaglercraft 1.8', url: 'https://eagler1-8-8-wasm-gc.vercel.app' },
    { name: 'Eaglercraft 1.12', url: 'https://math-class-school.vercel.app' },
    { name: 'House of Hazards', url: 'https://house-of-hazards-ashy.vercel.app' },
    { name: 'Dadish 1', url: 'https://dadish.vercel.app' },
    { name: 'Bad Monday Sim', url: 'https://badmondaysim.vercel.app/' },
    { name: 'Dadish 2', url: 'https://dadish2.vercel.app/' },
    { name: 'Stickman hook', url: 'https://stickman-hook-five.vercel.app' },
    { name: 'Bitlife', url: 'https://bitlife1.vercel.app' },
  ],
  content() {
    return `
      <style>
        .game-btn {
          font-size: 1rem;
          padding: 1rem 1.5rem;
        }
      </style>
      <section>
        <h1>Game Buttons</h1>
        <div class="game-btns">
          ${this.gamesList.map(game =>
            `<button class="game-btn" onclick="Apps.games.openGame('${game.url}')">${game.name}</button>`
          ).join('')}
        </div>
        <p style="margin-top:2rem;opacity:0.8"><em>Remember to smile 😋</em></p>
      </section>
    `;
  },
  openGame(url) {
    const win = window.open();
    if (!win) {
      alert('Popup blocked! Please allow popups for this site.');
      return;
    }
    if (!url) {
      win.document.write('<h1>Please configure the button with a real link!</h1>');
      win.document.close();
      return;
    }
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed. Status: ' + res.status);
        return res.text();
      })
      .then(html => {
        const fixedHtml = this.injectBase(html, url);
        const blob = new Blob([fixedHtml], { type: "text/html" });
        const blobUrl = URL.createObjectURL(blob);
        win.location = blobUrl;
      })
      .catch(e => {
        win.document.open();
        win.document.write('<h1>Failed to fetch content.</h1><pre>' + e.message + '</pre>');
        win.document.close();
      });
  },
  injectBase(html, url) {
    return html.replace(
      /<head[^>]*>/i,
      match => `${match}<base href="${url.replace(/\/?$/, '/')}">`
    );
  }
};
