// ============================================================
//  Shared UI components — header, footer, nav, toast, modal
// ============================================================

export function renderHeader(activePage) {
  const nav = [
    { id: 'index',      label: 'Главная',    href: '../index.html' },
    { id: 'operators',  label: 'Операторы',  href: 'operators.html' },
    { id: 'mechanics',  label: 'Механики',   href: 'mechanics.html' },
    { id: 'tips',       label: 'Советы',     href: 'tips.html' },
    { id: 'contacts',   label: 'Контакты',   href: 'contacts.html' },
  ];

  const navLinks = nav.map(n =>
    `<a href="${n.href}" class="nav-link${activePage === n.id ? ' active' : ''}">${n.label}</a>`
  ).join('');

  const mobileLinks = nav.map(n =>
    `<a href="${n.href}" class="nav-link${activePage === n.id ? ' active' : ''}">${n.label}</a>`
  ).join('');

  return `
  <header class="site-header">
    <div class="header-inner">
      <a href="../index.html" class="logo">
        <div class="logo-icon">⬡</div>
        <div class="logo-text"><span>Arknights</span> Guide</div>
      </a>
      <nav class="main-nav" aria-label="Основная навигация">${navLinks}</nav>
      <div class="header-meta">
        <span>📧 guide@arknights.help</span>
        <a href="https://discord.gg/arknights" target="_blank" rel="noopener">Discord</a>
      </div>
      <button class="burger" id="burger-btn" aria-label="Меню" aria-expanded="false">☰</button>
    </div>
    <nav class="mobile-nav" id="mobile-nav" aria-label="Мобильное меню">${mobileLinks}</nav>
  </header>`;
}

export function renderFooter() {
  return `
  <footer class="site-footer" role="contentinfo">
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-col">
          <div class="footer-col-title">Arknights Guide</div>
          <p style="color:var(--text-muted);font-size:.78rem;line-height:1.6">
            Неофициальный путеводитель для новичков.<br>
            Фанатский проект, не связанный с HyperGryph или Yostar.
          </p>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Разделы</div>
          <ul>
            <li><a href="../index.html">Главная</a></li>
            <li><a href="operators.html">Операторы</a></li>
            <li><a href="mechanics.html">Механики</a></li>
            <li><a href="tips.html">Советы новичку</a></li>
            <li><a href="contacts.html">Контакты</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Полезные ресурсы</div>
          <ul>
            <li><a href="https://arknights.wiki.gg" target="_blank" rel="noopener">Arknights Wiki</a></li>
            <li><a href="https://gamepress.gg/arknights" target="_blank" rel="noopener">GamePress</a></li>
            <li><a href="https://aceship.github.io/AN-EN-Tags/akhrec.html" target="_blank" rel="noopener">Recruitment Calc</a></li>
            <li><a href="https://prts.wiki" target="_blank" rel="noopener">PRTS Wiki (CN)</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Контакты</div>
          <ul>
            <li><a href="contacts.html">Обратная связь</a></li>
            <li><a href="mailto:guide@arknights.help">guide@arknights.help</a></li>
            <li><a href="https://discord.gg/arknights" target="_blank" rel="noopener">Discord-сервер</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-meta">
        <span>© 2025 Arknights Guide. Фанатский проект.</span>
        <span>
          Arknights является торговой маркой HyperGryph Co., Ltd. &nbsp;|&nbsp;
          <a href="privacy.html">Политика конфиденциальности</a> &nbsp;|&nbsp;
          <a href="terms.html">Условия использования</a>
        </span>
      </div>
    </div>
  </footer>`;
}

export function initBurger() {
  const btn  = document.getElementById('burger-btn');
  const menu = document.getElementById('mobile-nav');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? '✕' : '☰';
  });
}

// ── Toast ────────────────────────────────────────────────────
export function showToast(msg, duration = 2800) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// ── Modal ────────────────────────────────────────────────────
export function openModal(titleHtml, bodyHtml) {
  let backdrop = document.getElementById('global-modal');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'global-modal';
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title" id="modal-title"></div>
          <button class="modal-close" id="modal-close" aria-label="Закрыть">✕</button>
        </div>
        <div class="modal-body" id="modal-body"></div>
      </div>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }
  document.getElementById('modal-title').innerHTML = titleHtml;
  document.getElementById('modal-body').innerHTML  = bodyHtml;
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeModal() {
  const backdrop = document.getElementById('global-modal');
  if (backdrop) { backdrop.classList.remove('open'); document.body.style.overflow = ''; }
}

// ── Rarity helper ────────────────────────────────────────────
export function rarityStars(n) {
  return Array.from({length: n}, () => `<span></span>`).join('');
}

// ── Class emoji map ──────────────────────────────────────────
export const CLASS_EMOJI = {
  'Кастер':    '🔮',
  'Снайпер':   '🏹',
  'Страж':     '⚔️',
  'Охранник':  '🛡️',
  'Медик':     '💊',
  'Специалист':'🔧',
  'Поддержка': '🌟',
  'Разведчик': '🗡️',
};
