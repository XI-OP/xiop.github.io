// ============================================================
//  Arknights Guide — IndexedDB Database Layer
//  Works entirely client-side → GitHub Pages compatible
// ============================================================

const DB_NAME = 'ArknightsGuideDB';
const DB_VERSION = 1;

let db = null;

// ── Schema ───────────────────────────────────────────────────
const STORES = {
  operators: { keyPath: 'id', indexes: [['rarity','rarity'], ['class','class'], ['faction','faction']] },
  mechanics:  { keyPath: 'id', indexes: [['category','category']] },
  tips:       { keyPath: 'id', indexes: [['tag','tag']] },
  faq:        { keyPath: 'id' },
  progress:   { keyPath: 'key' },   // user-specific bookmark / read state
};

// ── Init ─────────────────────────────────────────────────────
export function initDB() {
  return new Promise((resolve, reject) => {
    if (db) { resolve(db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = e => {
      const d = e.target.result;
      for (const [name, opts] of Object.entries(STORES)) {
        if (d.objectStoreNames.contains(name)) continue;
        const store = d.createObjectStore(name, { keyPath: opts.keyPath });
        for (const [idxName, idxKey] of (opts.indexes || [])) {
          store.createIndex(idxName, idxKey, { unique: false });
        }
      }
    };

    req.onsuccess = e => {
      db = e.target.result;
      seedIfEmpty().then(() => resolve(db));
    };
    req.onerror = () => reject(req.error);
  });
}

// ── Generic helpers ───────────────────────────────────────────
function tx(storeName, mode = 'readonly') {
  return db.transaction(storeName, mode).objectStore(storeName);
}

export function getAll(storeName) {
  return new Promise((res, rej) => {
    const req = tx(storeName).getAll();
    req.onsuccess = () => res(req.result);
    req.onerror  = () => rej(req.error);
  });
}

export function getByIndex(storeName, indexName, value) {
  return new Promise((res, rej) => {
    const req = tx(storeName).index(indexName).getAll(value);
    req.onsuccess = () => res(req.result);
    req.onerror  = () => rej(req.error);
  });
}

export function getOne(storeName, key) {
  return new Promise((res, rej) => {
    const req = tx(storeName).get(key);
    req.onsuccess = () => res(req.result);
    req.onerror  = () => rej(req.error);
  });
}

export function putOne(storeName, record) {
  return new Promise((res, rej) => {
    const req = tx(storeName, 'readwrite').put(record);
    req.onsuccess = () => res(req.result);
    req.onerror  = () => rej(req.error);
  });
}

// ── Progress helpers (for bookmark / read tracking) ──────────
export function saveProgress(key, value) { return putOne('progress', { key, value }); }
export function loadProgress(key) {
  return getOne('progress', key).then(r => r ? r.value : null);
}

// ── Seed data ─────────────────────────────────────────────────
async function seedIfEmpty() {
  const existing = await getAll('operators');
  if (existing.length > 0) return;

  const operatorsData = [
    { id:'amiya',      name:'Амия',       rarity:5, class:'Кастер',    faction:'Rhodes Island', role:'Дальний атакующий маг', description:'Главная героиня. Стреляет магическими снарядами, наносит урон нескольким врагам.', tags:['Arts','AoE','Starter'], difficulty:'Легко' },
    { id:'exusiai',    name:'Экзусия',    rarity:6, class:'Снайпер',   faction:'Laterano',      role:'Скорострельный DPS',     description:'Стреляет несколькими пулями за атаку. Один из лучших снайперов начального и среднего этапа.', tags:['Physical','Multi-shot'], difficulty:'Средне' },
    { id:'silverash',  name:'Сильвераш',  rarity:6, class:'Страж',     faction:'Karlan Trade',  role:'Универсальный DPS',      description:'Чрезвычайно высокий урон, замедляет и наносит массовый урон своим S3.', tags:['Physical','Slow','AoE'], difficulty:'Сложно' },
    { id:'hoshiguma',  name:'Хошигума',   rarity:6, class:'Охранник',  faction:'L.G.D.',        role:'Танк с отражением урона',  description:'Накапливает урон блокируемых врагов и отражает его взрывом.', tags:['Tank','Reflect'], difficulty:'Средне' },
    { id:'ptilopsis',  name:'Птилопсис', rarity:5, class:'Медик',     faction:'Rhodes Island', role:'Восстановление SP',       description:'Пассивно ускоряет восстановление SP всей команды. Мастхэв-медик.', tags:['Heal','SP Recovery'], difficulty:'Легко' },
    { id:'eyjafjalla', name:'Эйяфьядла',  rarity:6, class:'Кастер',    faction:'Rhodes Island', role:'Мощный AoE маг',          description:'S2 — мощная одиночная атака, S3 — массовый магический ядерный удар.', tags:['Arts','AoE','Nuke'], difficulty:'Средне' },
    { id:'nearl',      name:'Нерл',       rarity:5, class:'Охранник',  faction:'Kazimierz',     role:'Исцеляющий танк',          description:'Восстанавливает HP союзников в радиусе. Идеальна для долгих волн.', tags:['Tank','Heal'], difficulty:'Легко' },
    { id:'shaw',       name:'Шоу',        rarity:4, class:'Специалист',faction:'Rhodes Island', role:'Отталкивание врагов',      description:'Отталкивает врагов и сбрасывает их с клеток. Незаменима в определённых картах.', tags:['Push','Crowd Control'], difficulty:'Средне' },
    { id:'perfumer',   name:'Парфюмер',   rarity:4, class:'Медик',     faction:'Rhodes Island', role:'Глобальный пассивный хил', description:'Пассивно исцеляет всех союзников на поле. Лучший 4★ медик для новичков.', tags:['Heal','AoE','Global'], difficulty:'Легко' },
    { id:'specter',    name:'Спектр',     rarity:5, class:'Страж',     faction:'Rim Billiton',  role:'Неуязвимый DPS',           description:'S2 — временная неуязвимость. Великолепна на тяжёлых этапах.', tags:['Physical','Invincible'], difficulty:'Средне' },
  ];

  const mechanicsData = [
    { id:'dp',       category:'economy',  title:'Точки развёртывания (DP)',        icon:'💠', description:'Ресурс для размещения операторов. Зарабатывается автоматически и за убийства врагов. Стоимость у каждого оператора своя. Отозванный оператор частично возвращает DP.' },
    { id:'cost',     category:'economy',  title:'Стоимость операторов',            icon:'💰', description:'Каждый оператор стоит от 6 до 25 DP. 1–2★ дешевле, 6★ — дороже. Некоторые операторы имеют бонус сниженной стоимости при повторном развёртывании.' },
    { id:'block',    category:'combat',   title:'Блокирование (Block)',             icon:'🛡️', description:'Операторы в ближнем бою блокируют врагов: держат их на месте. Число врагов = кол-во блоков оператора (обычно 1–3). Заблокированные враги атакуют только этого оператора.' },
    { id:'range',    category:'combat',   title:'Дальность атаки',                 icon:'🎯', description:'Дальнобойные операторы (Снайперы, Кастеры, Медики) атакуют из клеток с высотой. Дальность зависит от класса и таланта. Снайперы приоритизируют врагов с наибольшим числом пройденных клеток.' },
    { id:'trust',    category:'growth',   title:'Доверие (Trust)',                  icon:'❤️', description:'Растёт при использовании оператора в миссиях. На 100% Trust бонусные характеристики становятся постоянными даже без оператора в команде. До 200% доступно.' },
    { id:'potential', category:'growth',  title:'Потенциал (Potential)',            icon:'⬆️', description:'Улучшается за получение дубликатов оператора. Даёт небольшие бонусы: снижение стоимости, +ATK/DEF. Не критично для прохождения, но полезно для оптимизации.' },
    { id:'elite',    category:'growth',   title:'Элитизация (Elite)',               icon:'⭐', description:'E0 → E1 → E2. Открывает навыки, повышает статы, меняет облик. Требует материалов и LMD. E2 — финальная форма оператора с максимальным потенциалом.' },
    { id:'skill',    category:'skills',   title:'Навыки и SP',                      icon:'⚡', description:'Навыки активируются при накоплении SP. SP набирается атаками, пассивно или при ударах (зависит от навыка). Уровень навыка (1–7) и Мастерство (M1–M3) усиливают эффект.' },
    { id:'mastery',  category:'skills',   title:'Мастерство навыков (Mastery)',     icon:'🏅', description:'M1–M3 значительно улучшают навыки (урон, время, SP-стоимость). Для ключевых операторов приоритизируйте M3 на S3. Требует специальных материалов.' },
    { id:'modul',    category:'growth',   title:'Модули (Modules)',                 icon:'🔧', description:'Разблокируются при E2. Усиливают характеристики и навыки, меняют таланты. Некоторые модули полностью меняют стиль игры оператора.' },
    { id:'rogulike', category:'modes',    title:'Интегрированные стратегии (IS)',   icon:'🗺️', description:'Режим рогалика. Каждый заход уникален: выбор реликвий, отрядов, улучшений. Несколько тематических серий (Mizuki, Phantom и т.д.). Отличный способ фармить ресурсы.' },
    { id:'annihil',  category:'modes',    title:'Уничтожение (Annihilation)',       icon:'💥', description:'Еженедельный режим с 400 врагами. Даёт большой запас Orundum (валюта для призыва). Цель — не пропустить ни одного врага как можно дольше.' },
    { id:'cc',       category:'modes',    title:'Контракт кризиса (CC)',            icon:'📋', description:'Сезонный ивентовый режим. Карты с контрактами-ограничениями (например, -ATK у всех). Чем больше контрактов — тем выше оценка и награды. Испытание для опытных.' },
  ];

  const tipsData = [
    { id:'t1', tag:'beginner', title:'Начни с Медика и Охранника',       text:'В первые дни ставь Птилопсис или Парфюмера + прочный Охранник (Хошигума, Нерл). Это база любого состава.' },
    { id:'t2', tag:'beginner', title:'Не тревожься о 6★',                text:'4★ и 5★ операторы полностью проходят всю кампанию и большинство ивентов. Правильная стратегия важнее звёзд.' },
    { id:'t3', tag:'economy',  title:'Трать Originium только с умом',     text:'Originium (синие камни) — премиум валюта. Лучшее применение — восполнять Sanity сверх лимита во время лимитных ивентов или покупать Orundum.' },
    { id:'t4', tag:'economy',  title:'Фармь Уничтожение каждую неделю',  text:'Annihilation даёт 1800 Orundum в неделю — это 6 призывов. Пропускать нельзя.' },
    { id:'t5', tag:'growth',   title:'Приоритет Элитизации',             text:'E1 всем → E2 ключевым. Для начала: E2 DPS-операторам (Экзусия, Амия) и Медику. Остальные — по мере накопления материалов.' },
    { id:'t6', tag:'growth',   title:'Куда тратить LMD (золото)',         text:'LMD тратится на Элитизацию, уровни и крафт. Не трать на магазин при старте — он нужен для E2 материалов.' },
    { id:'t7', tag:'combat',   title:'Читай маршруты врагов',            text:'Перед каждым боем смотри маршруты. Одна точка входа = один блокировщик + дальнобойные. Несколько маршрутов — раздели команду.' },
    { id:'t8', tag:'combat',   title:'Высота имеет значение',            text:'Снайперы и Кастеры на высоких клетках атакуют дальше. Ставь их на возвышенности для максимального покрытия.' },
    { id:'t9', tag:'combat',   title:'Используй паузу (AUTO OFF)',       text:'Отключай автобой на сложных этапах. Ручное управление позволяет точно выбирать момент активации навыков.' },
    { id:'t10',tag:'meta',     title:'IS — лучший способ фарма',         text:'Интегрированные стратегии дают огромное количество материалов, опыта и Orundum. Играй каждый день.' },
  ];

  const faqData = [
    { id:'f1', q:'С чего начать абсолютному новичку?', a:'Пройди обучение, затем главу 0 и 1 основного сюжета. Собери команду из стартовых операторов и первых призывов. Не тревожься о "мета" — просто исследуй игру.' },
    { id:'f2', q:'Что такое Sanity (Рассудок)?', a:'Это очки энергии для прохождения уровней. Восстанавливается 1 ед./6 мин. Максимум растёт с уровнем доктора. Тратить Originium на его восполнение — спорно, лучше делать это только во время ивентов.' },
    { id:'f3', q:'Как получить 6★ операторов?', a:'Базовый шанс 2% в призыве. После 50 призывов без 6★ шанс растёт на 2% за каждый призыв. На 99-м призыве гарантирован 6★. Накапливай Orundum через Annihilation и ивенты.' },
    { id:'f4', q:'Нужно ли тратить деньги?', a:'Нет. Arknights проходима F2P (free-to-play). Большинство сложных режимов требуют стратегии, а не редких операторов. Донат ускоряет сбор коллекции, но не обязателен.' },
    { id:'f5', q:'Что делать, если не могу пройти уровень?', a:'1) Снизь ожидания — попробуй 3-звёздочное прохождение позже. 2) Прокачай операторов (уровень, E1). 3) Посмотри гайды на YouTube. 4) Измени состав — иногда нужен специфический класс.' },
    { id:'f6', q:'Стоит ли сохранять материалы или использовать сразу?', a:'Храни материалы для E2 ключевых операторов. Не тревожься о "перерасходе" на старте — в конце их будет достаточно.' },
  ];

  // bulk insert
  const t = db.transaction(['operators','mechanics','tips','faq'], 'readwrite');
  for (const op  of operatorsData) t.objectStore('operators').put(op);
  for (const mc  of mechanicsData) t.objectStore('mechanics').put(mc);
  for (const tip of tipsData)      t.objectStore('tips').put(tip);
  for (const fq  of faqData)       t.objectStore('faq').put(fq);

  return new Promise((res, rej) => {
    t.oncomplete = res;
    t.onerror    = () => rej(t.error);
  });
}
