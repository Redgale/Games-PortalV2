window.DesktopApps = [
  { id: 'home', title: 'Home/About', icon: '🏠', appFn: renderHomeApp },
  { id: 'games', title: 'Games', icon: '🎮', appFn: renderGamesApp },
  { id: 'fetcher', title: 'Website Fetcher', icon: '🌐', appFn: renderFetcherApp },
  { id: 'executor', title: 'HTML Executor', icon: '⚡', appFn: renderExecutorApp },
];

function renderHomeApp() {
  return `
    <h2>Welcome to Red Portal Desktop</h2>
    <p>
      This is a desktop-inspired web portal.<br>
      Use the start button (bottom left) to open apps.<br>
      Apps open in windows, which you can move, resize, minimize, maximize, or close.
    </p>
    <ul>
      <li><strong>Games:</strong> Play fun web games.</li>
      <li><strong>Website Fetcher:</strong> Open any site with fetcher (CORS required).</li>
      <li><strong>HTML Executor:</strong> Run HTML/CSS/JS in a window.</li>
    </ul>
    <p>
      <em>Try full-screen mode for a real desktop feel!</em>
    </p>
  `;
}

function renderGamesApp() {
  return `
    <h2>Game Library</h2>
    <div class="game-btns">
      ${window.GAME_LIST.map(game =>
        `<button class="game-btn" onclick="Desktop.launchGameWindow('${game.url}', '${game.name}')">${game.name}</button>`
      ).join('')}
    </div>
    <p style="margin-top:2rem;opacity:0.8"><em>Enjoy your games! 😋</em></p>
  `;
}

function renderFetcherApp() {
  return `
    <h2>Website Fetcher</h2>
    <form class="fletcher-box" onsubmit="Desktop.launchFetcherWindow(event)">
      <input type="url" id="fetcher-app-input" placeholder="Enter a website link here..." required />
      <button type="submit">Fetch & Open</button>
    </form>
    <p id="fetcher-app-status" style="margin-top:1rem;color:var(--accent);"></p>
  `;
}

function renderExecutorApp() {
  return `
    <h2>HTML Executor</h2>
    <div class="executor-box">
      <label for="executor-app-text">Type HTML to execute:</label>
      <textarea id="executor-app-text" placeholder="Type or paste your HTML, JS, or CSS here..."></textarea>
      <button onclick="Desktop.launchExecutorWindow()">Execute Typed HTML</button>
      <label for="executor-app-file">Or upload a file to execute as HTML:</label>
      <input type="file" id="executor-app-file" accept="*/*">
      <button onclick="Desktop.launchExecutorFileWindow()">Execute Uploaded File</button>
      <span id="executor-app-status" style="color:var(--accent);margin-top:5px;"></span>
    </div>
  `;
}
