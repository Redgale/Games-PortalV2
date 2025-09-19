// Web Browser App (uses existing fetch logic)

window.Apps = window.Apps || {};
Apps.fetcher = {
  title: 'Web Browser',
  icon: '🌐',
  open(opts={}) {
    WindowManager.create(this, opts);
  },
  content() {
    return `
      <div>
        <form class="fletcher-box" onsubmit="Apps.fetcher.handleFetch(event)">
          <input type="url" id="desktop-fetcher-input" placeholder="Enter a website link here..." required />
          <button type="submit">Fetch & Open</button>
        </form>
        <p id="desktop-fetcher-status" style="color:var(--accent);margin-top:5px;"></p>
      </div>
    `;
  },
  handleFetch(e) {
    e.preventDefault();
    const input = document.getElementById('desktop-fetcher-input');
    const status = document.getElementById('desktop-fetcher-status');
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
        const fixedHtml = Apps.fetcher.injectBase(html, url);
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
  },
  injectBase(html, url) {
    return html.replace(
      /<head[^>]*>/i,
      match => `${match}<base href="${url.replace(/\/?$/, '/')}">`
    );
  }
};
