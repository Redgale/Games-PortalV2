// Entrypoint: registers all apps/pages/widgets for context menu and launcher

window.Apps = window.Apps || {};

// Text Editor
Apps.texteditor = {
  title: 'Text Editor',
  icon: '📝',
  open(opts = {}) { WindowManager.create(this, opts); },
  content() {
    return '<textarea style="width:100%;height:220px;" placeholder="Type your notes here..."></textarea>';
  }
};

// Import Games app logic from apps/games.js (do not redefine here!)

// Fetcher (web browser, uses your fetch logic)
Apps.fetcher = window.Apps.fetcher;

// HTML Executor
Apps.executor = {
  title: 'HTML Executor',
  icon: '📄',
  open(opts = {}) { WindowManager.create(this, opts); },
  content() {
    return `
      <div class="executor-box">
        <label for="executor-text">Type HTML to execute:</label>
        <textarea id="executor-text" placeholder="Type or paste your HTML, JS, or CSS here..." style="width:100%;height:120px;"></textarea>
        <button onclick="window.Apps.executor.executeTypedHTML()">Execute Typed HTML</button>
        <label for="executor-file">Or upload a file to execute as HTML:</label>
        <input type="file" id="executor-file" accept="*/*">
        <button onclick="window.Apps.executor.executeUploadedFile()">Execute Uploaded File</button>
        <span id="executor-status" style="color:var(--accent);margin-top:5px;"></span>
      </div>
    `;
  },
  executeTypedHTML() {
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
    setTimeout(() => { status.textContent = ""; }, 3000);
  },
  executeUploadedFile() {
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
      setTimeout(() => { status.textContent = ""; }, 3000);
    };
    reader.onerror = function() {
      status.textContent = "Failed to read file.";
    };
    reader.readAsText(file);
    input.value = '';
  }
};

// Settings
Apps.settings = {
  title: 'Settings',
  icon: '⚙️',
  open(opts = {}) { WindowManager.create(this, opts); },
  content() {
    return `
      <div>
        <label for="wallpaper-url">Change Wallpaper (URL):</label>
        <input type="text" id="wallpaper-url" style="width:100%;" placeholder="Paste image URL here..." />
        <button onclick="window.Apps.settings.updateWallpaper()">Set Wallpaper</button>
        <span id="wallpaper-status" style="color:var(--accent);margin-top:5px;"></span>
      </div>
    `;
  },
  updateWallpaper() {
    const input = document.getElementById('wallpaper-url');
    const status = document.getElementById('wallpaper-status');
    if (input.value.trim()) {
      window.Desktop.setWallpaper(input.value.trim());
      status.textContent = "Wallpaper updated!";
      setTimeout(() => { status.textContent = ""; }, 2000);
      input.value = '';
    } else {
      status.textContent = "Please enter a valid image URL.";
      setTimeout(() => { status.textContent = ""; }, 2000);
    }
  }
};

// Calculator (basic)
Apps.calculator = {
  title: 'Calculator',
  icon: '🧮',
  open(opts = {}) { WindowManager.create(this, opts); },
  content() {
    return `
      <input type="text" id="calc-input" style="width:100%;font-size:1.2rem;" placeholder="Type an expression..." />
      <button onclick="window.Apps.calculator.calculate()">Calculate</button>
      <div id="calc-output" style="margin-top:1rem;color:var(--accent);"></div>
    `;
  },
  calculate() {
    const input = document.getElementById('calc-input');
    const output = document.getElementById('calc-output');
    try {
      output.textContent = eval(input.value);
    } catch {
      output.textContent = "Invalid expression.";
    }
  }
};

// Terminal (minimal)
Apps.terminal = {
  title: 'Terminal',
  icon: '💻',
  open(opts = {}) { WindowManager.create(this, opts); },
  content() {
    return `
      <div style="background:#232323;padding:1em;font-family:monospace;color:#fff;">
        <div id="terminal-history"></div>
        <input type="text" id="terminal-input" style="width:100%;background:#18181F;color:#fff;border:none;" placeholder="Type a command..." onkeydown="if(event.key==='Enter'){window.Apps.terminal.run()}">
      </div>
    `;
  },
  run() {
    const input = document.getElementById('terminal-input');
    const history = document.getElementById('terminal-history');
    if (input.value.trim()) {
      history.innerHTML += `<div style="color:var(--accent);">$ ${input.value}</div>`;
      history.innerHTML += `<div>${input.value}</div>`;
      input.value = '';
    }
  }
};

// File Explorer (virtual)
Apps.fileexplorer = {
  title: 'File Explorer',
  icon: '🗂️',
  open(opts = {}) { WindowManager.create(this, opts); },
  content() {
    return `<div>(File explorer coming soon!)</div>`;
  }
};

// Calendar (minimal)
Apps.calendar = {
  title: 'Calendar',
  icon: '📅',
  open(opts = {}) { WindowManager.create(this, opts); },
  content() {
    return `<div>${new Date().toLocaleDateString()}</div>`;
  }
};

// Notification system (minimal)
Apps.notification = {
  title: 'Notifications',
  icon: '🔔',
  open(opts = {}) { WindowManager.create(this, opts); },
  content() {
    return `<div>(No notifications yet!)</div>`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Boot sequence if desired
});
