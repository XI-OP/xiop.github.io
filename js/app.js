/**
 * app.js — Rhodes Island Interface Controller
 */

/* ══ Router ══ */
const Router = {
  page: () => {
    const path = location.pathname;
    if (path.endsWith('operators.html')) return 'operators';
    if (path.endsWith('contact.html'))   return 'contact';
    if (path.endsWith('admin.html'))     return 'admin';
    return 'home';
  },
  go: (p) => { location.href = p; },
};

/* ══ Nav highlight ══ */
function setActiveNav() {
  const page = Router.page();
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.remove('active');
    if (l.dataset.page === page) l.classList.add('active');
  });
}

/* ══ Header user state ══ */
function renderHeader() {
  const user = DB.currentUser();
  const authZone = document.getElementById('auth-zone');
  if (!authZone) return;

  if (user) {
    authZone.innerHTML = `
      <div class="user-info">
        <span class="username-text">${user.avatar} <strong style="color:var(--text-primary)">${user.displayName}</strong></span>
        <span class="user-badge ${user.role === 'admin' ? 'admin' : ''}">${user.role === 'admin' ? '⚡ ADMIN' : '◈ DOCTOR'}</span>
        ${user.role === 'admin' ? `<a href="admin.html" class="btn btn-outline btn-sm">Панель</a>` : ''}
        <button class="btn btn-ghost btn-sm" onclick="Auth.logout()">Выйти</button>
      </div>`;
  } else {
    authZone.innerHTML = `
      <button class="btn btn-outline btn-sm" onclick="Auth.showLogin()">Войти</button>
      <button class="btn btn-amber btn-sm" onclick="Auth.showRegister()">Регистрация</button>`;
  }
}

/* ══ Auth modals ══ */
const Auth = {
  showLogin() {
    Modal.open(`
      <div class="modal-header">
        <span class="modal-title">// АВТОРИЗАЦИЯ</span>
        <button class="modal-close" onclick="Modal.close()">✕</button>
      </div>
      <div class="modal-body">
        <p class="hud-label" style="margin-bottom:1.5rem">Введите ваши учётные данные, Доктор.</p>
        <div id="login-alert"></div>
        <div class="form-group">
          <label class="form-label">Позывной</label>
          <input id="l-username" class="form-input" type="text" placeholder="doctor_username" autocomplete="username">
        </div>
        <div class="form-group">
          <label class="form-label">Пароль</label>
          <input id="l-password" class="form-input" type="password" placeholder="••••••••" autocomplete="current-password">
        </div>
        <button class="btn btn-amber" style="width:100%;justify-content:center" onclick="Auth.doLogin()">
          ▶ Войти в систему
        </button>
        <p style="margin-top:1rem;text-align:center;color:var(--text-muted);font-size:0.85rem">
          Нет аккаунта? <a href="#" onclick="Auth.showRegister()" style="color:var(--amber)">Регистрация</a>
        </p>
        <div style="margin-top:1.5rem;padding:0.75rem;background:var(--bg-deep);border:1px solid var(--border)">
          <p class="hud-label" style="margin-bottom:0.4rem">Тестовый аккаунт администратора</p>
          <p style="font-family:monospace;font-size:0.8rem;color:var(--text-secondary)">
            Логин: <strong style="color:var(--amber)">admin</strong> &nbsp; Пароль: <strong style="color:var(--amber)">admin123</strong>
          </p>
        </div>
      </div>
    `);
  },

  doLogin() {
    const username = document.getElementById('l-username').value.trim();
    const password = document.getElementById('l-password').value;
    if (!username || !password) {
      showAlert('login-alert', 'Заполните все поля.', 'error'); return;
    }
    const res = DB.login({ username, password });
    if (!res.ok) { showAlert('login-alert', res.error, 'error'); return; }
    Modal.close();
    renderHeader();
    showToast(`Добро пожаловать, ${res.user.displayName}!`, 'success');
    if (res.user.role === 'admin' && location.pathname.endsWith('index.html') || location.pathname === '/') {
      // stay on home
    }
  },

  showRegister() {
    Modal.open(`
      <div class="modal-header">
        <span class="modal-title">// РЕГИСТРАЦИЯ</span>
        <button class="modal-close" onclick="Modal.close()">✕</button>
      </div>
      <div class="modal-body">
        <p class="hud-label" style="margin-bottom:1.5rem">Создайте профиль Доктора Rhodes Island.</p>
        <div id="reg-alert"></div>
        <div class="form-group">
          <label class="form-label">Позывной</label>
          <input id="r-username" class="form-input" type="text" placeholder="your_callsign">
        </div>
        <div class="form-group">
          <label class="form-label">Отображаемое имя</label>
          <input id="r-displayname" class="form-input" type="text" placeholder="Доктор Иванов">
        </div>
        <div class="form-group">
          <label class="form-label">Пароль</label>
          <input id="r-password" class="form-input" type="password" placeholder="мин. 6 символов">
        </div>
        <div class="form-group">
          <label class="form-label">Повторите пароль</label>
          <input id="r-password2" class="form-input" type="password" placeholder="повторите пароль">
        </div>
        <button class="btn btn-amber" style="width:100%;justify-content:center" onclick="Auth.doRegister()">
          ▶ Создать профиль
        </button>
        <p style="margin-top:1rem;text-align:center;color:var(--text-muted);font-size:0.85rem">
          Уже зарегистрированы? <a href="#" onclick="Auth.showLogin()" style="color:var(--amber)">Войти</a>
        </p>
      </div>
    `);
  },

  doRegister() {
    const username    = document.getElementById('r-username').value.trim();
    const displayName = document.getElementById('r-displayname').value.trim();
    const password    = document.getElementById('r-password').value;
    const password2   = document.getElementById('r-password2').value;

    if (!username || !password) { showAlert('reg-alert', 'Заполните обязательные поля.', 'error'); return; }
    if (password.length < 6)    { showAlert('reg-alert', 'Пароль должен быть не менее 6 символов.', 'error'); return; }
    if (password !== password2) { showAlert('reg-alert', 'Пароли не совпадают.', 'error'); return; }

    const res = DB.register({ username, password, displayName });
    if (!res.ok) { showAlert('reg-alert', res.error, 'error'); return; }

    // auto-login
    DB.login({ username, password });
    Modal.close();
    renderHeader();
    showToast(`Профиль создан! Добро пожаловать, ${res.user.displayName}!`, 'success');
  },

  logout() {
    DB.logout();
    renderHeader();
    showToast('Вы вышли из системы.', 'warning');
    if (location.pathname.endsWith('admin.html')) Router.go('index.html');
  }
};

/* ══ Modal ══ */
const Modal = {
  open(html) {
    let overlay = document.getElementById('modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modal-overlay';
      overlay.className = 'modal-overlay';
      overlay.addEventListener('click', e => { if (e.target === overlay) Modal.close(); });
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `<div class="modal">${html}</div>`;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // Focus first input
    setTimeout(() => { const f = overlay.querySelector('input'); if (f) f.focus(); }, 50);
  },
  close() {
    const o = document.getElementById('modal-overlay');
    if (o) { o.style.display = 'none'; o.innerHTML = ''; }
    document.body.style.overflow = '';
  }
};

/* ══ Toast notifications ══ */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:2rem;right:2rem;z-index:9000;display:flex;flex-direction:column;gap:0.5rem';
    document.body.appendChild(container);
  }
  const colors = { success: 'var(--teal)', error: 'var(--red)', warning: 'var(--amber)' };
  const toast = document.createElement('div');
  toast.style.cssText = `
    background:var(--bg-panel);
    border:1px solid ${colors[type]};
    color:${colors[type]};
    padding:0.75rem 1.25rem;
    font-family:'Share Tech Mono',monospace;
    font-size:0.8rem;
    max-width:300px;
    animation:fadeInUp 0.3s ease;
    box-shadow:0 0 20px ${colors[type]}33;
  `;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = '0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}

/* ══ Alert inside modals/panels ══ */
function showAlert(containerId, message, type) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

/* ══ Guard admin page ══ */
function guardAdmin() {
  if (!Router.page() === 'admin') return;
  if (location.pathname.endsWith('admin.html')) {
    if (!DB.isAdmin()) {
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:1rem">
          <p style="font-family:'Share Tech Mono',monospace;color:var(--red);font-size:1.2rem">// ДОСТУП ЗАПРЕЩЁН</p>
          <a href="index.html" class="btn btn-outline">← Вернуться</a>
        </div>`;
    }
  }
}

/* ══ Enter key on forms ══ */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const modal = document.getElementById('modal-overlay');
    if (modal && modal.style.display !== 'none') {
      const loginBtn = modal.querySelector('[onclick="Auth.doLogin()"]');
      const regBtn   = modal.querySelector('[onclick="Auth.doRegister()"]');
      if (loginBtn) loginBtn.click();
      else if (regBtn) regBtn.click();
    }
  }
});

/* ══ Init ══ */
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  renderHeader();
  guardAdmin();
});
