// Main portal logic and page rendering

const PAGES = [
  { id: 'home', title: 'Home', active: true },
  { id: 'games', title: 'Games', active: false },
  { id: 'proxies', title: 'Proxies', active: false },
  { id: 'fetcher', title: 'Website Fetcher', active: false },
  { id: 'executor', title: 'HTML Executor', active: false },
];

function showPage(pageId) {
  PAGES.forEach(p => p.active = (p.id === pageId));
  document.getElementById('navbar').innerHTML = renderNavbar(PAGES);
  document.getElementById('main-content').innerHTML = getPageContent(pageId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  triggerScrollAnimations();
}

function getPageContent(pageId) {
  switch (pageId) {
    case 'home':
      return (
        renderSection("Welcome to Red Portal",
          `<p>
            <strong>DISCLAIMER:</strong> If you are a member of IT from any organization, this website is not intended for you. Please leave.<br>
            <br>
            Scroll down to see more sections.<br>
          </p>
          <h2>Why this site?</h2>
          <p>
            <strong>We are UNBEATABLE</strong><br>
            This portal gives you quick access to web games that run without wifi and do not save your progress via cookies. Some games may provide alternative save options.<br>
            Our approach bypasses restrictions and censorship, making fun always accessible!
          </p>
          <h2>Sections</h2>
          <ul>
            <li><strong>Games</strong>: Launch fun games from the site.</li>
            <li><strong>Website Fetcher</strong>: Paste a link and, if CORS allows, open it as a Blob in a new tab.</li>
            <li><strong>HTML Executor</strong>: Paste/upload HTML, CSS, or JS to run in a new tab (cookies persist in your browser).</li>
          </ul>
        `)
      );
    case 'games':
      return (
        renderSection("Game Library",
          `<div class="game-btns">
            ${window.GAME_LIST.map(game =>
              `<button class="game-btn" onclick="fetchAndOpenBlob('${game.url}')">${game.name}</button>`
            ).join('')}
          </div>
          <p style="margin-top:2rem;opacity:0.8"><em>Enjoy your games! 😋</em></p>`
        )
      );
    case 'proxies':
      return (
        renderSection("Proxy Tools",
          `<div class="game-btns">
            ${window.PROXY_LIST.map(proxy =>
              `<button class="game-btn" onclick="fetchAndOpenBlob('${proxy.url}')">${proxy.name}</button>`
            ).join('')}
          </div>
          <p style="margin-top:2rem;opacity:0.8"><em>Surf freely! 😋</em></p>`
        )
      );
    case 'fetcher':
      return (
        renderSection("Website Fetcher",
          `<p>
            Paste a URL below and fetch its HTML to open in a new tab.<br>
            <strong>Note:</strong> Only sites with correct CORS headers will work.
          </p>
          <form class="fletcher-box" onsubmit="fletcherFetchAndOpenBlob(event)">
            <input type="url" id="fletcher-input" placeholder="Enter a website link here..." required />
            <button type="submit">Fetch & Open</button>
          </form>
          ${renderStatus("fletcher-status")}
          `
        )
      );
    case 'executor':
      return (
        renderSection("HTML Executor",
          `<p>
            Paste or upload any file type below and it will be executed as HTML in a new tab.<br>
            <strong>Tip:</strong> You may write HTML, JS, CSS, or upload any file. Data saved as cookies from the opened tab will persist in your browser.
          </p>
          <div class="executor-box">
            <label for="executor-text">Type HTML to execute:</label>
            <textarea id="executor-text" placeholder="Type or paste your HTML, JS, or CSS here..."></textarea>
            <button onclick="executeTypedHTML()">Execute Typed HTML</button>
            <label for="executor-file">Or upload a file to execute as HTML:</label>
            <input type="file" id="executor-file" accept="*/*">
            <button onclick="executeUploadedFile()">Execute Uploaded File</button>
            <span id="executor-status" style="color:var(--accent);margin-top:5px;"></span>
          </div>
          `
        )
      );
    default:
      return renderSection("404", "<p>Page not found.</p>");
  }
}

// --- Shared Logic (from original) ---

function injectBase(html, url) {
  return html.replace(
    /<head[^>]*>/i,
    match => `${match}<base href="${url.replace(/\/?$/, '/')}">`
  );
}
function fetchAndOpenBlob(url) {
  const win = window.open();
  if (!win) {
    alert('Popup blocked! Please allow popups for this site.');
    return;
  }
  if (!url || url === 'insert link here') {
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
      const fixedHtml = injectBase(html, url);
      const blob = new Blob([fixedHtml], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      win.location = blobUrl;
    })
    .catch(e => {
      win.document.open();
      win.document.write('<h1>Failed to fetch content.</h1><pre>' + e.message + '</pre>');
      win.document.close();
    });
}
function fletcherFetchAndOpenBlob(e) {
  e.preventDefault();
  const input = document.getElementById('fletcher-input');
  const status = document.getElementById('fletcher-status');
  let url = input.value.trim();
  const win = window.open();
  if (!win) {
    status.textContent = "Popup blocked! Please allow popups for this site.";
    return;
  }
  if (!url) {
    status.textContent = "Please enter a URL.";
    win.document.write('<h1>Please enter a URL.</h1>');
    win.document.close();
    return;
  }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  status.textContent = "Fetching and opening: " + url;
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('Fetch failed. Status: ' + res.status);
      return res.text();
    })
    .then(html => {
      const fixedHtml = injectBase(html, url);
      const blob = new Blob([fixedHtml], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      win.location = blobUrl;
      status.textContent = "Opened in new tab!";
    })
    .catch(e => {
      win.document.open();
      win.document.write('<h1>Failed to fetch content.</h1><pre>' + e.message + '</pre>');
      win.document.close();
      status.textContent = "Failed to fetch.\nError: " + e.message;
    });
  setTimeout(()=>{status.textContent = "";}, 3500);
  input.value = '';
}
function executeTypedHTML() {
  const status = document.getElementById('executor-status');
  const html = document.getElementById('executor-text').value;
  if (!html.trim()) {
    status.textContent = "Please enter HTML or code to execute.";
    return;
  }
  const win = window.open();
  if (!win) {
    status.textContent = "Popup blocked! Please allow popups for this site.";
    return;
  }
  const blob = new Blob([html], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);
  win.location = blobUrl;
  status.textContent = "Executed in new tab.";
  setTimeout(()=>{status.textContent = "";}, 3000);
}
function executeUploadedFile() {
  const status = document.getElementById('executor-status');
  const input = document.getElementById('executor-file');
  const file = input.files[0];
  if (!file) {
    status.textContent = "Please select a file to execute.";
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const win = window.open();
    if (!win) {
      status.textContent = "Popup blocked! Please allow popups for this site.";
      return;
    }
    const blob = new Blob([e.target.result], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    win.location = blobUrl;
    status.textContent = "File executed in new tab.";
    setTimeout(()=>{status.textContent = "";}, 3000);
  };
  reader.onerror = function() {
    status.textContent = "Failed to read file.";
  };
  reader.readAsText(file);
  input.value = '';
}

// --- Animation ---
function triggerScrollAnimations() {
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('visible'));
  setTimeout(() => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, {threshold: 0.3});
    document.querySelectorAll('section').forEach(sec => observer.observe(sec));
  }, 200);
}

// Initial Render
document.addEventListener("DOMContentLoaded", () => {
  showPage("home");
  window.addEventListener('hashchange', () => {
    const page = location.hash.replace('#','') || 'home';
    showPage(page);
  });
});
