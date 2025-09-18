// Renders navigation bar and page containers

function renderNavbar(pages) {
  return pages.map(page =>
    `<a href="#" id="nav-${page.id}" class="${page.active ? 'active' : ''}" onclick="showPage('${page.id}')">${page.title}</a>`
  ).join('');
}

function renderSection(title, content) {
  return `
    <section>
      <h1>${title}</h1>
      ${content}
    </section>
  `;
}

function renderStatus(id, color = "var(--accent)") {
  return `<p id="${id}" style="margin-top:1rem;color:${color};"></p>`;
}
