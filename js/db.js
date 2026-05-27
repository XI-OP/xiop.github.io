/**
 * db.js — Rhodes Island Database (localStorage-based)
 * Works on GitHub Pages without any backend.
 */

const DB = (() => {
  const KEYS = {
    USERS: 'ark_users',
    SESSION: 'ark_session',
    REQUESTS: 'ark_requests',
    OPERATORS: 'ark_operators',
  };

  /* ── helpers ── */
  const get = (k) => JSON.parse(localStorage.getItem(k) || 'null');
  const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  /* ── seed ── */
  function seed() {
    if (!get(KEYS.USERS)) {
      set(KEYS.USERS, [
        {
          id: 1,
          username: 'admin',
          password: btoa('admin123'),   // base64 — demo only
          role: 'admin',
          displayName: 'Доктор (Администратор)',
          avatar: '⚕️',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    if (!get(KEYS.OPERATORS)) {
      set(KEYS.OPERATORS, [
        { id: 1, name: 'Amiya', rarity: 6, class: 'Caster', faction: 'Rhodes Island', bio: 'Лидер Rhodes Island. Амия — Кендхт, несущая огромное бремя ответственности за спасение зараженных.' },
        { id: 2, name: 'Exusiai', rarity: 6, class: 'Sniper', faction: 'Penguin Logistics', bio: 'Беззаботная снайпер из Penguin Logistics. Любит яблочный пирог и всегда в хорошем настроении.' },
        { id: 3, name: 'SilverAsh', rarity: 6, class: 'Guard', faction: 'Karlan Commercial', bio: 'Генеральный директор Karlan Commercial. Истинный лорд Севера, холодный и расчётливый.' },
        { id: 4, name: 'Hoshiguma', rarity: 6, class: 'Defender', faction: 'L.G.D.', bio: 'Детектив L.G.D. Непробиваемый щит Lungmen, верный страж закона и порядка.' },
        { id: 5, name: 'Nightingale', rarity: 6, class: 'Medic', faction: 'Rhodes Island', bio: 'Главный медик Rhodes Island. Её Арт создаёт куполы защиты и исцеляет союзников.' },
        { id: 6, name: 'Surtr', rarity: 6, class: 'Guard', faction: 'Пришелец', bio: 'Таинственный оператор с разрушительной огненной силой. Происхождение неизвестно.' },
        { id: 7, name: 'Blaze', rarity: 6, class: 'Guard', faction: 'Rhodes Island', bio: 'Харизматичный гвардеец, сочетающий ближний бой и огненный Арт.' },
        { id: 8, name: 'Ifrit', rarity: 6, class: 'Caster', faction: 'Rhodes Island', bio: 'Гений Арт-науки, способный испепелить любую цель сфокусированным лучом.' },
      ]);
    }
    if (!get(KEYS.REQUESTS)) {
      set(KEYS.REQUESTS, []);
    }
  }

  /* ── users ── */
  function getUsers() { return get(KEYS.USERS) || []; }
  function saveUsers(u) { set(KEYS.USERS, u); }

  function register({ username, password, displayName }) {
    const users = getUsers();
    if (users.find(u => u.username === username)) {
      return { ok: false, error: 'Позывной уже занят.' };
    }
    const user = {
      id: Date.now(),
      username,
      password: btoa(password),
      role: 'user',
      displayName: displayName || username,
      avatar: '🩺',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    return { ok: true, user };
  }

  function login({ username, password }) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === btoa(password));
    if (!user) return { ok: false, error: 'Неверный позывной или пароль.' };
    const session = { userId: user.id, role: user.role, ts: Date.now() };
    set(KEYS.SESSION, session);
    return { ok: true, user, session };
  }

  function logout() { localStorage.removeItem(KEYS.SESSION); }

  function currentUser() {
    const session = get(KEYS.SESSION);
    if (!session) return null;
    return getUsers().find(u => u.id === session.userId) || null;
  }

  function isAdmin() {
    const u = currentUser();
    return u && u.role === 'admin';
  }

  /* ── requests ── */
  function getRequests() { return get(KEYS.REQUESTS) || []; }

  function submitRequest({ subject, message, type }) {
    const user = currentUser();
    if (!user) return { ok: false, error: 'Необходима авторизация.' };
    const requests = getRequests();
    const req = {
      id: Date.now(),
      userId: user.id,
      displayName: user.displayName,
      username: user.username,
      subject,
      message,
      type,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    requests.push(req);
    set(KEYS.REQUESTS, requests);
    return { ok: true, request: req };
  }

  function updateRequestStatus(id, status) {
    const requests = getRequests();
    const r = requests.find(r => r.id === id);
    if (r) { r.status = status; set(KEYS.REQUESTS, requests); }
  }

  /* ── operators ── */
  function getOperators() { return get(KEYS.OPERATORS) || []; }

  seed();
  return { register, login, logout, currentUser, isAdmin, submitRequest, getRequests, updateRequestStatus, getOperators };
})();
