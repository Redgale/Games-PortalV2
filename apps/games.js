// Games App: Restored original Games page logic/UI

window.Apps = window.Apps || {};
Apps.games = {
  title: 'Games',
  icon: '🎮',
  open(opts = {}) {
    WindowManager.create(this, opts);
  },
  content() {
    return `
      <section>
        <h1>Game Library</h1>
        <div class="game-btns">
          ${window.GAME_LIST.map(game =>
            `<button class="game-btn" onclick="fetchAndOpenBlob('${game.url}')">${game.name}</button>`
          ).join('')}
        </div>
        <p style="margin-top:2rem;opacity:0.8"><em>Enjoy your games! 😋</em></p>
      </section>
    `;
  }
};
