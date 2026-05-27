/**
 * layout.js — Injects shared header and footer into every page
 */
document.addEventListener('DOMContentLoaded', () => {
  injectLayout();
});

function injectLayout() {
  /* ── Header ── */
  const headerEl = document.getElementById('site-header');
  if (headerEl) {
    headerEl.innerHTML = `
      <div class="header-left">
        <a href="index.html" class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" fill="none" stroke="#ffbe32" stroke-width="1.5"/>
              <polygon points="18,8 28,13 28,23 18,28 8,23 8,13" fill="rgba(255,190,50,0.1)" stroke="#ffbe32" stroke-width="1"/>
              <circle cx="18" cy="18" r="4" fill="#ffbe32"/>
              <line x1="18" y1="2"  x2="18" y2="8"  stroke="#ffbe32" stroke-width="1"/>
              <line x1="18" y1="28" x2="18" y2="34" stroke="#ffbe32" stroke-width="1"/>
            </svg>
          </div>
          <div>
            <span class="logo-text">Rhodes Island</span>
            <span class="logo-sub">Pharmaceutical Inc.</span>
          </div>
        </a>
        <nav>
          <a href="index.html"     class="nav-link" data-page="home">Главная</a>
          <a href="operators.html" class="nav-link" data-page="operators">Операторы</a>
          <a href="contact.html"   class="nav-link" data-page="contact">Контакт</a>
        </nav>
      </div>
      <div class="header-right">
        <div id="auth-zone" style="display:flex;align-items:center;gap:0.75rem"></div>
      </div>
    `;
  }

  /* ── Footer ── */
  const footerEl = document.getElementById('site-footer');
  if (footerEl) {
    footerEl.innerHTML = `
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo">
            <div class="logo-icon" style="width:28px;height:28px">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" fill="none" stroke="#ffbe32" stroke-width="1.5"/>
                <circle cx="18" cy="18" r="4" fill="#ffbe32"/>
              </svg>
            </div>
            <span class="logo-text">Rhodes Island</span>
          </div>
          <p class="footer-desc">
            Мы — фармацевтическая компания и оперативная организация, работающая во имя тех, кто поражён Оригинием. Вместе мы найдём лечение.
          </p>
        </div>
        <div>
          <p class="footer-title">Навигация</p>
          <ul class="footer-links">
            <li><a href="index.html">Главная</a></li>
            <li><a href="operators.html">Операторы</a></li>
            <li><a href="contact.html">Оставить заявку</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-title">Контакты</p>
          <div class="footer-contact">
            <span class="label">Связь</span>
            <span>rhodes@terra.net</span>
            <span class="label" style="margin-top:0.5rem">Телефон</span>
            <span>+7 (000) 174-0-000</span>
            <span class="label" style="margin-top:0.5rem">Политика</span>
            <span><a href="#" style="color:var(--text-secondary)">Конфиденциальность</a></span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Rhodes Island Pharmaceutical Inc. — Все права защищены.</span>
        <span class="mono">TERRA // ORIGINIUM PROTOCOL v2.4</span>
      </div>
    `;
  }

  /* ── Decorations ── */
  const decos = ['tl','tr','bl','br'].map(c => {
    const d = document.createElement('div');
    d.className = `corner-deco ${c}`;
    return d;
  });
  decos.forEach(d => document.body.appendChild(d));

  const grid = document.createElement('div');
  grid.className = 'bg-grid';
  document.body.prepend(grid);
}
