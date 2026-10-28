import { categories, flatDrinks, defaults } from './data.js';
import { createBackend } from './backend.js';

const ICONS = {
  home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22v-8h6v8"/>',
  cup: '<path d="M5 9h13v6a6.5 6.5 0 0 1-13 0V9Z"/><path d="M18 10h2a3 3 0 0 1 0 6h-2M3 22h17M9 5c-2-2 2-3 0-5M14 5c-2-2 2-3 0-5"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8S3 8 4 4s8-2 8 4Zm0 0s9 0 8-4-8-2-8 4Z"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5A8.5 8.5 0 1 1 21 11.5Z"/>',
  support: '<path d="M3 13v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="12" width="5" height="8" rx="2"/><rect x="17" y="12" width="5" height="8" rx="2"/><path d="M20 20c0 2-3 3-6 3"/>',
  thumbsUp: '<path d="M7 10v11H3a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h4Zm0 0 5-7c1-1 3-1 3 1l-1 5h6a2 2 0 0 1 2 2l-2 9a2 2 0 0 1-2 1H7"/>',
  thumbsDown: '<path d="M7 14V3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h4Zm0 0 5 7c1 1 3 1 3-1l-1-5h6a2 2 0 0 0 2-2l-2-9a2 2 0 0 0-2-1H7"/>',
  search: '<circle cx="10.8" cy="10.8" r="7.2"/><path d="m16 16 5 5"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  arrow: '<path d="M19 12H5m7-7-7 7 7 7"/>',
  star: '<path d="m12 2 3.2 6.7 7.4 1.1-5.3 5.1 1.2 7.2-6.5-3.4-6.5 3.4 1.2-7.2-5.3-5.1 7.4-1.1Z"/>',
  shield: '<path d="M12 22S4 18 4 11V5l8-3 8 3v6c0 7-8 11-8 11Z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  phone: '<path d="M22 16.4v3a2.5 2.5 0 0 1-2.8 2.5A19 19 0 0 1 2.1 4.8 2.5 2.5 0 0 1 4.6 2h3a2 2 0 0 1 2 1.7l.5 2.8a2 2 0 0 1-.6 1.8L7.6 10a15 15 0 0 0 6.4 6.4l1.7-1.9a2 2 0 0 1 1.8-.6l2.8.5a2 2 0 0 1 1.7 2Z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4L22 2ZM11 13l11-11"/>',
  sparkle: '<path d="m12 2 1.8 7.2L21 11l-7.2 1.8L12 20l-1.8-7.2L3 11l7.2-1.8L12 2ZM19 18l1 2 2 1-2 1-1 2-1-2-2-1 2-1Z"/>',
  graph: '<path d="M3 3v18h18M7 17v-5M12 17V8M17 17V5"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
  download: '<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  crown: '<path d="m2 8 5 5 5-9 5 9 5-5-2 12H4Z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  coffeeBeans: '<path d="M20 4C9 1 4 8 4 14s4 8 9 6 10-10 7-16ZM5 17c5-1 6-6 10-8"/>',
};
const icon = (name, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.cup}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const n = value => Number(value || 0).toLocaleString('fa-IR');
const stamp = value => value ? new Date(value).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
const page = document.body.dataset.page;
const SUPPORT_CONTACTS = [
  { name: 'بهرام ایمانی', phone: '09197489913' },
  { name: 'مهدی قهرمانی', phone: '09016688302' }
];
const live = Boolean(window.UNICAFE_CONFIG?.supabaseUrl && window.UNICAFE_CONFIG?.supabaseAnonKey);
const state = { client: null, catalog: [], settings: { ...defaults }, comments: {}, openComments: new Set(), filter: 'all', query: '', admin: null, adminTab: 'overview' };
const stored = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const defaultFlags = { is_visible: true, votes_enabled: true, show_results: true, comments_enabled: true, comments_visible: true };

function demoCatalog() {
  const votes = stored('uc_votes', {});
  const flags = stored('uc_drink_flags', {});
  const cfg = { ...defaults, ...stored('uc_settings', {}) };
  return {
    settings: cfg,
    drinks: flatDrinks.map(drink => {
      const my_vote = votes[drink.code] || 0;
      return { ...drink, ...flags[drink.code], my_vote, likes: my_vote === 1 ? 1 : 0, dislikes: my_vote === -1 ? 1 : 0, total: my_vote ? 1 : 0 };
    })
  };
}
function renderShell() {
  const links = [ ['index', 'خانه', 'home'], ['drinks', 'نوشیدنی‌ها', 'cup'], ['about', 'داستان ما', 'info'], ['club', 'باشگاه ویژه', 'gift'], ['contact', 'پشتیبانی', 'support'] ];
  const nav = links.map(([id, title]) => `<a href="${id}.html" class="${page === id ? 'active' : ''}" ${page === id ? 'aria-current="page"' : ''}>${esc(title)}</a>`).join('');
  const bottomNav = links.map(([id, title, ico]) => `<a href="${id}.html" class="${page === id ? 'active' : ''}" ${page === id ? 'aria-current="page"' : ''}>${icon(ico)}<span>${esc(title)}</span></a>`).join('');
  document.getElementById('app').innerHTML = `
    <header class="site-header"><div class="shell head-row">
      <a href="index.html" class="brand" aria-label="UniCafe خانه"><img src="assets/logo.svg" alt="UniCafe"><span class="flag" aria-label="ایتالیا"><i></i><i></i><i></i></span></a>
      <nav class="head-nav" aria-label="فهرست اصلی">${nav}</nav>
      <div class="top-action"><a class="btn btn-ghost" href="drinks.html">${icon('heart')} نظر بده</a></div>
      <button class="mobile-menu-trigger" aria-label="باز کردن فهرست" aria-expanded="false" aria-controls="mobile-drawer" type="button">${icon('menu',24)}</button>
    </div></header>
    <div class="mobile-drawer-backdrop" hidden></div><nav class="mobile-drawer" id="mobile-drawer" aria-label="فهرست صفحات موبایل" inert>
    <div class="mobile-drawer-heading"><img src="assets/logo.svg" alt="UniCafe"><button type="button" class="mobile-menu-close" aria-label="بستن فهرست">✕</button></div>
    ${links.map(([id, title, ico]) => `<a href="${id}.html" ${page === id ? 'aria-current="page"' : ''}>${icon(ico)} ${esc(title)} ${icon('chevron',16)}</a>`).join('')}
    </nav>
    <main id="page-main" class="page"></main>
    ${live ? '' : '<div class="demo-bar">نسخه نمایشی: داده‌ها فقط در همین مرورگر هستند. برای استفاده عمومی، پایگاه داده را متصل کنید.</div>'}
    <footer class="footer"><div class="shell"><div class="footer-grid">
      <div><a href="index.html"><img src="assets/logo.svg" alt="UniCafe"></a><p>یک فنجان بهتر، با نظر تو.</p></div>
      <div class="foot-links"><a href="drinks.html">ثبت نظر</a><a href="club.html">باشگاه ویژه</a><a href="about.html">داستان ما</a><a href="contact.html">ارتباط با ما</a><a href="admin.html">مدیریت</a></div>
    </div><div class="footer-bottom"><span>UniCafe · Italian Coffee Style</span><span>کتابخانه دانشگاه زنجان · از ۱۴۰۱ کنار شما</span></div></div></footer>
    <nav class="bottom-nav" aria-label="ناوبری موبایل">${bottomNav}</nav>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>`;
}
let toastTimer;
function toast(msg, error = false) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.className = `toast visible${error ? ' error' : ''}`;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.className = 'toast', 4200);
}
function setMain(html) { document.getElementById('page-main').innerHTML = html; }
function note(text) { return `<div class="notice">${icon('shield', 17)} ${esc(text)}</div>`; }

async function initBackend() {
  if (!live) return;
  state.client = createBackend(window.UNICAFE_CONFIG);
}
function browserId() {
  let id = localStorage.getItem('unicafe-browser');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id || '')) {
    id = crypto.randomUUID(); localStorage.setItem('unicafe-browser', id);
  }
  return id;
}
async function rpc(name, args = {}) {
  if (['public_catalog', 'vote_drink', 'send_comment', 'send_message', 'join_club'].includes(name)) {
    args = { ...args, p_browser: browserId() };
  }
  const { data, error } = await state.client.rpc(name, args);
  if (error) throw error;
  return data;
}
async function loadCatalog() {
  const data = live ? await rpc('public_catalog') : demoCatalog();
  state.catalog = data.drinks || [];
  state.settings = { ...defaults, ...data.settings };
}
function categoryOf(id) { return categories.find(c => c.id === id); }
function img(src, alt = '') { return `<img src="assets/${esc(src)}" alt="${esc(alt)}" loading="lazy">`; }
function intro(kicker, title, description) {
  return `<div class="page-hero shell"><div class="page-intro"><span class="eyebrow">${esc(kicker)}</span><h1>${title}</h1><p class="lead">${esc(description)}</p></div></div>`;
}
function renderHome() {
  const catCards = categories.map(c => `<a href="drinks.html#${c.id}" class="category-tile">${img(c.photo, c.fa)}<span class="count">${n(c.items.length)} نوشیدنی</span><b>${esc(c.fa)}</b><small dir="ltr">${esc(c.en)}</small></a>`).join('');
  setMain(`<section class="hero hero-reference">
    <div class="ref-top-art" aria-hidden="true"><img class="ref-beans" src="assets/hero-beans.webp" alt=""><img class="ref-rome" src="assets/hero-colosseum.webp" alt=""></div>
    <div class="ref-brand"><img src="assets/logo.svg" alt="UniCafe - Tiam Vending Company"><span class="ref-flag" aria-hidden="true"><i></i><i></i><i></i></span></div>
    <div class="ref-center"><div class="ref-heading"><h1>نظرت خیلی مهمه</h1><p>به ما کمک کن بهتر بشیم</p></div>
      <a class="ref-cta" href="drinks.html"><span class="ref-heart">${icon('heart',27)}</span><span>ثبت نظر برای نوشیدنی‌ها</span>${icon('chevron',23)}</a>
      <div class="ref-shortcuts"><a href="contact.html" class="ref-shortcut">${icon('support',30)}<span>پشتیبانی<br>و ساپورت</span></a>
      <a href="contact.html#message" class="ref-shortcut">${icon('chat',30)}<span>پیام ناشناس<br>به ما</span></a>
      <a href="about.html" class="ref-shortcut">${icon('info',30)}<span>درباره ما</span></a></div>
    </div>
    <div class="ref-scene" aria-hidden="true"><div class="ref-wood"></div><div class="ref-handwriting">A cup<br><em>for a better day</em><span class="italy-stripe"></span></div><img class="ref-cup" src="assets/hero-cup.webp" alt=""><div class="ref-ground-beans"></div></div>
  </section>
  <div class="shell"><section class="section"><div class="section-head"><div><span class="eyebrow">YOUR EXPERIENCE MATTERS</span><h2>همه‌چیز به سادگی یک لمس</h2></div></div>
    <div class="feature-grid">
      <a href="drinks.html" class="feature-card"><div class="bubble">${icon('heart',26)}</div><h3>رأی بده</h3><p>با یک لایک یا دیسلایک تجربه واقعی‌ات رو ثبت کن و نتیجه عمومی رو ببین.</p></a>
      <a href="drinks.html" class="feature-card"><div class="bubble">${icon('chat',26)}</div><h3>نظرت رو بنویس</h3><p>درباره نوشیدنی‌ها نظر بذار. نظرات بعد از تأیید مدیر نمایش داده می‌شن.</p></a>
      <a href="club.html" class="feature-card"><div class="bubble">${icon('gift',26)}</div><h3>به جمع ویژه‌ها بپیوند</h3><p>برای اطلاع از فرصت‌های هدیه و شرکت در قرعه‌کشی‌های احتمالی عضو شو.</p></a>
    </div></section>
    <section class="section"><div class="section-head"><div><span class="eyebrow">EXPLORE THE MENU</span><h2>دنیای طعم‌های UniCafe</h2><p>نوشیدنی‌ات رو از روی کد دستگاه پیدا کن.</p></div><a class="btn btn-ghost" href="drinks.html">مشاهده منو ${icon('arrow')}</a></div>
      <div class="category-grid">${catCards}</div></section>
    <section class="section home-story-card"><div class="home-story-copy"><span class="eyebrow">OUR STORY · SINCE 1401</span><h2>این داستان، از کتابخونه شروع شد.</h2><p>دو دانشجو، یک ایده ساده و یک دستگاه قهوه قرمز؛ از اواخر مرداد ۱۴۰۱ تا امروز، UniCafe با خاطره‌های شما بزرگ شد.</p><a href="about.html" class="btn btn-ghost">داستان ما رو بخون ${icon('arrow')}</a></div><a href="about.html" class="home-story-image" aria-label="داستان UniCafe"><img src="assets/necta-1401.webp" alt="دستگاه قرمز Necta در روزهای آغازین UniCafe" loading="lazy"></a></section>
    <section class="section"><div class="spotlight"><div><span class="tag">${icon('crown',15)} CLUB UNICAFE</span><h2>یه جای ویژه برای دوستداران قهوه</h2><p>نام و شماره‌ات رو ثبت کن و برای قرعه‌کشی‌های UniCafe در فهرست اعضا باش.</p></div><a class="btn btn-primary" href="club.html">عضویت در باشگاه ${icon('arrow')}</a></div></section>
  </div>`);
}
function drinkCard(d) {
  const c = categoryOf(d.category) || categories[0];
  const enabled = state.settings.polls_visible && state.settings.votes_enabled && d.votes_enabled;
  const results = state.settings.polls_visible && state.settings.results_visible && d.show_results;
  const allowComments = state.settings.comments_enabled && d.comments_enabled;
  const showComments = state.settings.comments_visible && d.comments_visible;
  const commentsOpen = state.openComments.has(d.code);
  const pct = d.total ? Math.round(d.likes / d.total * 100) : 0;
  return `<article class="drink-card compact-drink" data-code="${d.code}">
    <div class="drink-compact-row"><div class="drink-thumb">${img(c.photo, d.name)}</div><span class="drink-code">${d.code}</span>
      <div class="drink-name"><strong>${esc(d.name)}</strong></div>
      ${state.settings.polls_visible ? `<div class="compact-votes">
      <button class="vote like ${d.my_vote === 1 ? 'active' : ''}" data-vote="1" data-code="${d.code}" ${enabled ? '' : 'disabled'} aria-label="پسندیدن ${esc(d.name)}" aria-pressed="${d.my_vote === 1}">${icon('thumbsUp',21)}</button>
      <button class="vote dislike ${d.my_vote === -1 ? 'active' : ''}" data-vote="-1" data-code="${d.code}" ${enabled ? '' : 'disabled'} aria-label="نپسندیدن ${esc(d.name)}" aria-pressed="${d.my_vote === -1}">${icon('thumbsDown',21)}</button></div>` : ''}
    </div><div class="drink-compact-meta">
      <span>${state.settings.polls_visible ? (results ? (d.total ? `${n(pct)}٪ رضایت · ${n(d.likes)} پسند · ${n(d.dislikes)} نپسند` : 'هنوز رأیی ثبت نشده') : 'نتایج به انتخاب مدیر مخفی است') : 'نظرسنجی این نوشیدنی غیرفعال است'}</span>
      ${(allowComments || showComments) ? `<button type="button" data-comments="${d.code}" aria-expanded="${commentsOpen}">${icon('chat',16)} نظرات ${commentsOpen ? '−' : '+'}</button>` : ''}
    </div>
    ${results && d.total ? `<div class="rate-meter" aria-label="رضایت ${pct} درصد"><i style="width:${pct}%"></i></div>` : ''}
    ${commentsOpen ? commentArea(d, allowComments, showComments) : ''}
  </article>`;
}
function commentArea(d, canWrite, canRead) {
  const items = state.comments[d.code] || [];
  return `<div class="comments-box">
   ${canRead ? (items.length ? items.map(c => `<div class="comment"><div class="comment-line"><strong>${esc(c.name || 'ناشناس')}</strong><time>${stamp(c.created_at)}</time></div><p>${esc(c.body)}</p></div>`).join('') : '<p class="fine">هنوز نظر تأییدشده‌ای برای این نوشیدنی ثبت نشده.</p>') : '<p class="fine">نمایش نظرات این نوشیدنی غیرفعال است.</p>'}
   ${canWrite ? `<form data-comment-form="${d.code}"><input class="input" name="name" maxlength="40" placeholder="نام نمایشی (اختیاری)" autocomplete="nickname"><textarea class="textarea" name="body" required minlength="3" maxlength="700" placeholder="نظرت درباره این نوشیدنی چیه؟" aria-label="متن نظر"></textarea><button class="btn btn-muted" type="submit">${icon('send')} ارسال برای تأیید</button></form>` : ''}
  </div>`;
}
function renderDrinks() {
  const filter = state.filter;
  const query = state.query.trim().toLocaleLowerCase('fa');
  const chips = [['all','همه نوشیدنی‌ها'],...categories.map(c=>[c.id,c.fa])].map(([id, label]) =>
    `<button type="button" class="chip ${filter === id ? 'active' : ''}" data-filter="${id}">${esc(label)}</button>`).join('');
  const groups = categories.map(c => {
    const drinks = state.catalog.filter(d => d.category === c.id && d.is_visible &&
      (filter === 'all' || filter === c.id) && (!query || `${d.name} ${d.code} ${c.fa}`.toLocaleLowerCase('fa').includes(query)));
    if (!drinks.length) return '';
    return `<section id="${c.id}" class="cat-section tone-${c.tone}"><div class="cat-title"><div><h2>${esc(c.fa)}</h2><small dir="ltr">${esc(c.en)}</small></div><span class="qty">${n(drinks.length)} نوشیدنی</span></div><div class="drinks-grid">${drinks.map(drinkCard).join('')}</div></section>`;
  }).join('');
  setMain(`<div class="poll-reference-head shell"><a href="index.html" aria-label="بازگشت به صفحه اصلی">${icon('chevron',25)}</a><h1>ثبت نظر برای نوشیدنی‌ها</h1><span class="poll-cup-icon">${icon('cup',32)}</span></div><p class="poll-hint shell">نوشیدنی‌ات رو انتخاب کن و با یک لمس نظرت رو ثبت کن.</p>
    <div class="shell"><div class="controls"><label class="search">${icon('search')}<input id="drink-search" type="search" placeholder="جست‌وجو با نام یا کد نوشیدنی" value="${esc(state.query)}" aria-label="جست‌وجوی نوشیدنی"></label><span class="tag">${n(state.catalog.filter(d=>d.is_visible).length)} نوشیدنی</span></div>
    <div class="chips" aria-label="فیلتر دسته‌ها">${chips}</div><div id="drink-groups">${groups || '<div class="no-results">نوشیدنی‌ای پیدا نشد.</div>'}</div>
    <section id="leaderboard">${leaderboard()}</section>
    ${note('هر مرورگر یک رأی قابل‌تغییر برای هر نوشیدنی دارد. پاک‌کردن داده‌های مرورگر یا استفاده از دستگاه دیگر، شناسهٔ تازه می‌سازد؛ این روش تضمین یک نفر، یک رأی نیست.')}
    </div>`);
  const search = document.getElementById('drink-search');
  search.addEventListener('input', e => {
    state.query = e.target.value;
    updateDrinkList();
  });
  document.querySelectorAll('[data-filter]').forEach(el => el.addEventListener('click', () => {
    state.filter = el.dataset.filter;
    state.openComments.clear();
    renderDrinks();
  }));
  const target = location.hash.replace('#','');
  if (target && categories.some(c=>c.id===target) && !state.query && state.filter === 'all') {
    state.filter = target;
    history.replaceState(null, '', location.pathname);
    renderDrinks();
  }
}
function updateDrinkList() {
  const query = state.query.trim().toLocaleLowerCase('fa');
  const groups = categories.map(c => {
    const drinks = state.catalog.filter(d => d.category === c.id && d.is_visible && (state.filter === 'all' || state.filter === c.id)
      && (!query || `${d.name} ${d.code} ${c.fa}`.toLocaleLowerCase('fa').includes(query)));
    return drinks.length ? `<section id="${c.id}" class="cat-section tone-${c.tone}"><div class="cat-title"><div><h2>${esc(c.fa)}</h2><small dir="ltr">${esc(c.en)}</small></div><span class="qty">${n(drinks.length)} نوشیدنی</span></div><div class="drinks-grid">${drinks.map(drinkCard).join('')}</div></section>` : '';
  }).join('');
  document.getElementById('drink-groups').innerHTML = groups || '<div class="no-results">نوشیدنی‌ای پیدا نشد.</div>';
  const ranking = document.getElementById('leaderboard');
  if (ranking) ranking.innerHTML = leaderboard();
}
function leaderboard() {
  if (!state.settings.polls_visible || !state.settings.results_visible || !state.settings.leaderboard_enabled) return '';
  const drinks = state.catalog.filter(d => d.is_visible && d.show_results && d.total >= state.settings.min_votes)
    .sort((a,b) => b.likes / b.total - a.likes / a.total || b.total - a.total || a.code - b.code).slice(0,3);
  return `<div class="glass mt"><h2>${icon('crown')} محبوب‌ترین نوشیدنی‌ها</h2>${drinks.length ? drinks.map(d => `<p><b>${esc(d.name)} · کد ${d.code}</b> — ${n(Math.round(d.likes/d.total*100))}٪ رضایت از ${n(d.total)} رأی</p>`).join('') : `<p>پس از ثبت حداقل ${n(state.settings.min_votes)} رأی برای هر نوشیدنی، نتیجه اینجا نمایش داده می‌شود.</p>`}</div>`;
}
async function vote(code, chosen, button) {
  const d = state.catalog.find(item => item.code === code);
  if (!d) return;
  const value = d.my_vote === chosen ? 0 : chosen;
  button.disabled = true;
  try {
    if (live) { await rpc('vote_drink', { p_code: code, p_value: value }); }
    else { const all = stored('uc_votes', {}); all[code] = value; save('uc_votes', all); }
    await loadCatalog(); updateDrinkList();
    toast(value ? 'رأی شما ثبت شد. ممنون از همراهی‌ات!' : 'رأی شما برداشته شد.');
  } catch (error) { button.disabled = false; toast(`ثبت رأی انجام نشد: ${error.message}`, true); }
}
async function toggleComments(code) {
  if (state.openComments.has(code)) { state.openComments.delete(code); updateDrinkList(); return; }
  try {
    if (state.settings.comments_visible) {
      if (live) state.comments[code] = await rpc('get_public_comments', { p_code: code });
      else state.comments[code] = stored('uc_comments', []).filter(c => c.code === code && c.status === 'approved');
    }
    state.openComments.add(code); updateDrinkList();
  } catch(error) { toast('خواندن نظرات با خطا مواجه شد.',true); }
}
async function submitComment(form) {
  const code = Number(form.dataset.commentForm);
  const data = new FormData(form), name = String(data.get('name') || '').trim(), body = String(data.get('body') || '').trim();
  if (body.length < 3 || body.length > 700 || name.length > 40) { toast('متن نظر باید بین ۳ تا ۷۰۰ نویسه باشد.',true); return; }
  const button = form.querySelector('button'); button.disabled = true;
  try {
    if (live) { await rpc('send_comment', { p_code: code, p_name: name, p_body: body }); }
    else {
      const comments = stored('uc_comments', []);
      comments.unshift({ id: (globalThis.crypto?.randomUUID?.() || 'preview-' + Date.now() + '-' + Math.random().toString(36).slice(2)), code, name, body, status: 'pending', created_at: new Date().toISOString() });
      save('uc_comments', comments);
    }
    form.reset(); toast('نظرت ثبت شد و بعد از تأیید مدیر نمایش داده می‌شه.');
  } catch(error) { toast(`ارسال نظر ناموفق بود: ${error.message}`,true); }
  finally { button.disabled = false; }
}
function renderContact() {
  const optional = String(state.settings.support_phone || '').replace(/[^\d+]/g, '');
  const whatsapp = String(state.settings.support_whatsapp || '').replace(/\D/g, '');
  const contacts = [...SUPPORT_CONTACTS, ...(optional && !SUPPORT_CONTACTS.some(c => c.phone === optional) ? [{name:'تماس تکمیلی',phone:optional}]:[])];
  const cards = contacts.map(c => `<article class="support-person">
    <div class="support-person-head"><span class="support-avatar">${icon('support',26)}</span><div><h3>${esc(c.name)}</h3><span>پشتیبانی UniCafe</span></div></div>
    <b class="support-number" dir="ltr">${esc(c.phone)}</b>
    <div class="support-buttons"><a class="btn call-action" href="tel:${esc(c.phone)}">${icon('phone',18)} تماس مستقیم</a><button class="btn btn-ghost" type="button" data-copy-phone="${esc(c.phone)}" aria-label="کپی شماره ${esc(c.name)}">${icon('copy',18)} کپی شماره</button></div>
  </article>`).join('');
  setMain(`<div class="reference-subhead shell"><span class="reference-subhead-icon">${icon('support',43)}</span><h1>پشتیبانی و ساپورت</h1><p>اگر سؤال، مشکل یا پیشنهادی دارید، کنار شما هستیم.</p></div>
  <div class="shell section support-layout"><section class="glass"><span class="tag">${icon('phone',16)} DIRECT CONTACT</span><h2 class="subheading">تماس با ما</h2><p>روی شماره بزن تا صفحه تماس گوشی باز بشه، یا اون رو کپی کن.</p>
    <div class="support-people">${cards}</div>
    ${whatsapp ? `<a class="contact-option" rel="noopener noreferrer" target="_blank" href="https://wa.me/${esc(whatsapp)}"><div class="side"><div class="circle-icon">${icon('chat')}</div><div><strong>پیام در واتساپ</strong><small>گفت‌وگو با پشتیبانی</small></div></div><span class="arrow">${icon('arrow')}</span></a>` : ''}
    ${state.settings.support_hours ? `<p class="help-row">${icon('clock',16)} زمان پاسخگویی: ${esc(state.settings.support_hours)}</p>` : ''}
  </section>
  <section class="glass" id="message"><span class="tag">${icon('chat',16)} ANONYMOUS MESSAGE</span><h2 class="subheading">پیام ناشناس</h2><p>حرفی داری که می‌خوای خصوصی بمونه؟ بدون نام و شماره بنویس. فقط مدیر پیام رو می‌بینه.</p>
    <form id="message-form"><div class="field"><label for="message-body" class="field-label">پیام شما</label><textarea id="message-body" name="body" class="textarea" minlength="5" maxlength="1000" required placeholder="پیشنهاد، انتقاد یا هر چیزی که دوست داری بهمون بگی..."></textarea><small>حداکثر ۱۰۰۰ نویسه</small></div><button class="btn btn-primary btn-full" type="submit">${icon('send')} ارسال پیام ناشناس</button></form>
    <p class="help-row">نام و شماره درخواست نمی‌شود، اما میزبان سایت ممکن است اطلاعات فنی اتصال را پردازش کند.</p>
  </section></div>
  <div class="shell support-closer"><span>${icon('heart',24)}</span><p>فنجون‌ها پر و خالی شدند، ترم‌ها اومدند و رفتند؛ ما کنار شما موندیم.</p><a href="about.html">داستان UniCafe ${icon('arrow',16)}</a></div>`);
  document.getElementById('message-form').addEventListener('submit', async e => {
    e.preventDefault(); const form = e.target, body = form.body.value.trim();
    if (body.length < 5) { toast('پیامت خیلی کوتاهه.',true);return; }
    if (!live) { toast('برای ارسال واقعی پیام، ابتدا Supabase را متصل کن.',true); return; }
    const btn = form.querySelector('button'); btn.disabled = true;
    try { await rpc('send_message',{ p_body: body }); form.reset(); toast('پیامت با موفقیت برای مدیر ارسال شد.'); }
    catch(error){ toast(`ارسال پیام ناموفق بود: ${error.message}`,true); }
    finally { btn.disabled = false; }
  });
}
function renderAbout() {
  const segments = [
    {
      date: 'اواخر مرداد ۱۴۰۱', label: 'THE BEGINNING', number: '01', photo: 'necta-1401.webp',
      alt: 'دستگاه قهوه قرمز ایتالیایی Necta در کتابخانه دانشگاه زنجان',
      title: 'همه‌چیز از یک جای خالی شروع شد',
      paragraphs: [
        'قصه UniCafe از یک سؤال خیلی ساده شروع شد: چرا کتابخانه دانشگاه زنجان، با این‌همه دانشجویی که ساعت‌ها بین کتاب و جزوه می‌گذرونن، نباید یک گوشه برای قهوه خوب و با قیمت مناسب داشته باشه؟',
        'اواخر مرداد ۱۴۰۱ بود. من دانشجوی مهندسی برق بودم و شوهرخواهرم که خودش دوره کارشناسی رو همین دانشگاه گذرونده بود، برای مقطع ارشد دوباره به زنجان برگشته بود. ما دو نفر از دل همین روزمرگی‌های دانشگاهی به یک ایده مشترک رسیدیم: قهوه باید نزدیک، در دسترس و بخشی از حال‌وهوای کتابخونه باشه.',
        'این شد که یک دستگاه قرمز ایتالیایی Necta آوردیم؛ بی‌خبر از اینکه قراره از یک دستگاه ساده، کلی خاطره ساخته بشه.'
      ], caption: 'اولین دستگاه UniCafe؛ شروع قصه با یک Necta قرمز'
    },
    {
      date: 'همان سال ۱۴۰۱', label: 'MORE THAN COFFEE', number: '02', photo: 'snack-1401.webp',
      alt: 'دستگاه خوراکی کنار دستگاه قهوه در کتابخانه دانشگاه زنجان',
      title: 'قرار نبود فقط قهوه باشه',
      paragraphs: [
        'استقبال از دستگاه از چیزی که فکر می‌کردیم خیلی بیشتر شد. کم‌کم هات‌چاکلت و کاپوچینوش شدند بخشی از روزهای کتابخونه؛ نوشیدنی‌هایی که برای بعضی از بچه‌ها، حتی بعد از فارغ‌التحصیلی، مزه یک خاطره قدیمی رو دارن. بعضی‌ها هنوز از اون دستگاه قرمز مثل یک افسانه کوچیکِ کتابخونه یاد می‌کنن.',
        'همان سال، کنارش دستگاه خوراکی هم گذاشتیم. می‌خواستیم وقتی بین کلاس‌ها، وقت استراحت یا وسط یک روز تعطیل چیزی برای خوردن لازم دارید، مجبور نباشید کتابخونه رو ترک کنید. یک قهوه، یک میان‌وعده، و چند دقیقه انرژی برای ادامه روز.'
      ], caption: 'دستگاه خوراکی؛ همراه روزهای شلوغ و تعطیل کتابخانه'
    },
    {
      date: 'سال ۱۴۰۴', label: 'THE NEXT CHAPTER', number: '03', photo: 'robot-1404.webp',
      alt: 'دستگاه جدید قهوه حرفه‌ای در کنار دستگاه خوراکی دانشگاه زنجان',
      title: 'یک باریستای تازه، از جنس فلز',
      paragraphs: [
        'اما خاطره خوب به معنی متوقف‌شدن نیست. در سال ۱۴۰۴ تصمیم گرفتیم کیفیت رو یک قدم جلوتر ببریم و دستگاهی حرفه‌ای‌تر برای عصاره‌گیری قهوه بیاریم؛ دستگاهی ایتالیایی با بازوی مکانیکی که هر فنجون رو با حرکت‌های حساب‌شده آماده می‌کنه.',
        'برای ما، اون بازوی فلزی فقط یک قطعه مکانیکی نبود؛ انگار یک باریستای کوچیک و خستگی‌ناپذیر پشت پیشخوان ایستاده بود. فناوری عوض شد، اما دلیل اصلی حضورمون نه: اینکه یک استراحت کوتاه با طعم قهوه، روز درس‌خوندن رو کمی بهتر کنه.'
      ], caption: 'فصل تازه UniCafe؛ دستگاه جدید در کنار همراه قدیمی‌اش'
    }
  ];
  const blocks = segments.map((s, index) => `<article class="story-chapter ${index % 2 ? 'story-reverse' : ''}" aria-labelledby="story-${index}">
    <div class="story-writing"><div class="story-step"><span>${s.number}</span><div><b>${s.date}</b><small dir="ltr">${s.label}</small></div></div>
      <h2 id="story-${index}">${s.title}</h2>${s.paragraphs.map(p => `<p>${p}</p>`).join('')}</div>
    <figure class="story-photo"><img src="assets/${s.photo}" alt="${s.alt}" loading="eager" width="640" height="860"><figcaption>${icon('calendar',15)} ${s.caption}</figcaption></figure>
  </article>`).join('');
  setMain(`<section class="about-cover"><div class="shell about-cover-inner">
      <span class="eyebrow">THE STORY OF UNICAFE · SINCE 1401</span>
      <span class="about-eyemark">${icon('cup',30)}</span>
      <h1>بعضی قصه‌ها با <span class="accent">یک فنجون قهوه</span> شروع می‌شن.</h1>
      <p>از یک ایده دونفره توی کتابخانه دانشگاه زنجان تا خاطره‌هایی که با شما ساختیم.</p>
      <div class="about-meta"><span>اواخر مرداد ۱۴۰۱</span><span class="about-metadot"></span><span>کتابخانه دانشگاه زنجان</span><span class="about-metadot"></span><span>هنوز ادامه داره...</span></div>
    </div></section>
    <div class="shell about-content"><div class="about-intro-note"><span class="about-opening">«</span><p>ما فقط دنبال گذاشتن یک دستگاه قهوه نبودیم. دنبال همون لحظه کوتاهی بودیم که بین دو ساعت درس‌خوندن، آدم می‌تونه یک نفس راحت بکشه.</p></div>
    <section class="story-timeline" aria-label="تاریخچه UniCafe">${blocks}</section>
    <section class="about-farewell"><span class="eyebrow">MEHR 1405 · A PERSONAL NOTE</span><div class="about-last-grid"><div><span class="about-last-mark">۱۴۰۵</span><h2>و حالا، نزدیک آخرین روزهای دانشجویی...</h2>
      <p>مهر ۱۴۰۵ است و من کم‌کم به آخر مسیر کارشناسی نزدیک می‌شم. وقتی به این چند سال نگاه می‌کنم، می‌بینم بهترین بخشش فقط کلاس‌ها، پروژه‌ها و امتحان‌ها نبود؛ آدم‌هایی بودن که هر روز توی راهروها و کتابخونه دیدیم، سلام کردیم و کنار هم گذروندیم.</p>
      <p>روزهایی بود که از صبح تا شب، بین درس و کار و خستگی، خودم هم با قهوه سر پا می‌موندم. برای همین خوب می‌فهمم یک فنجون ساده، وسط یک روز طولانی، چقدر می‌تونه به‌موقع باشه.</p>
      <p>از همه دوست‌ها، هم‌دانشگاهی‌ها و همکارهایی که در این سال‌ها همراه ما بودن، ممنونم. اگر از اون دستگاه قرمز یک خاطره دارید، یا هنوز گاهی برای یک کاپوچینو سر می‌زنید، بدونید این قصه رو شما ساختید. و قصه UniCafe هنوز ادامه داره.</p>
      <div class="about-signature"><span>با مهر و قدردانی</span><strong>مهدی قهرمانی</strong><span>مهرماه ۱۴۰۵</span></div></div>
      <aside class="about-quote"><span>${icon('heart',29)}</span><blockquote>فنجون‌ها پر و خالی شدند،<br>ترم‌ها اومدند و رفتند؛<br><em>ما کنار شما موندیم.</em></blockquote><div class="italian-stroke" aria-hidden="true"><i></i><i></i><i></i></div></aside></div></section>
    <div class="about-next"><p>این داستان برای شماست. شما هم از UniCafe خاطره‌ای دارید؟</p><div><a class="btn btn-primary" href="drinks.html">${icon('heart')} به نوشیدنی‌ها رأی بده</a><a class="btn btn-ghost" href="contact.html">${icon('chat')} برامون پیام بفرست</a></div></div></div>`);
}

function normalizeDigits(input) { return input.replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632)); }
function normalizePhone(phone) {
  const p = normalizeDigits(phone).replace(/[\s()-]/g,'');
  return /^\+989\d{9}$/.test(p) ? '0' + p.slice(3) : /^989\d{9}$/.test(p) ? '0' + p.slice(2) : p;
}
function renderClub() {
  setMain(`${intro('SPECIAL MEMBERS · UNICAFE','باشگاه <span class="accent">ویژه‌ها</span>','اگر اهل قهوه و سورپرایزی، اینجا جای توئه. ثبت‌نام کن تا در فهرست قرعه‌کشی‌های آینده UniCafe باشی.')}
  <div class="shell"><div class="highlights">
    <div class="highlight">${icon('gift')}<b>فرصت دریافت هدیه</b><span>در صورت برگزاری رویداد</span></div>
    <div class="highlight">${icon('star')}<b>قرعه‌کشی تصادفی</b><span>از فهرست اعضای واجد شرایط</span></div>
    <div class="highlight">${icon('shield')}<b>اطلاعات خصوصی</b><span>فقط برای مدیر قابل مشاهده</span></div>
  </div>
  <div class="section two-col"><section class="glass"><span class="tag">${icon('crown',15)} JOIN THE CLUB</span><h2 style="margin-top:16px">فرم عضویت ویژه</h2><p>عضویت رایگانه و کمتر از یک دقیقه زمان می‌بره.</p>
    ${state.settings.club_enabled ? `<form id="club-form" novalidate><div class="field"><label class="field-label" for="club-name">نام و نام خانوادگی <span class="accent">*</span></label><input class="input" id="club-name" name="full_name" maxlength="80" minlength="2" autocomplete="name" required placeholder="مثلاً مهدی محمدی"></div>
    <div class="field"><label class="field-label" for="club-phone">شماره موبایل <span class="accent">*</span></label><input class="input" id="club-phone" name="phone" type="tel" maxlength="18" inputmode="tel" autocomplete="tel" dir="ltr" required placeholder="09123456789"><small>برای شناسایی عضو و اطلاع‌رسانی درباره جوایز</small></div>
    <div class="field"><label class="field-label" for="club-telegram">آیدی تلگرام (اختیاری)</label><input class="input" id="club-telegram" name="telegram" dir="ltr" maxlength="33" placeholder="@username"><small>اگر تمایلی نداری، خالی بذار.</small></div>
    <div class="field"><label class="form-check"><input name="consent" type="checkbox" required><span>با ثبت و نگهداری نام، شماره موبایل و آیدی تلگرام (در صورت ارائه) برای مدیریت باشگاه، قرعه‌کشی و تماس درباره جوایز موافقم. می‌دانم عضویت تضمین دریافت جایزه نیست و برای حذف اطلاعات می‌توانم با پشتیبانی تماس بگیرم.</span></label></div>
    <button class="btn btn-primary btn-full" type="submit">${icon('gift')} عضویت در باشگاه UniCafe</button></form>` : '<div class="notice">عضویت باشگاه فعلاً توسط مدیر غیرفعال شده است.</div>'}
    <p class="help-row">تا زمانی که تأیید شماره پیامکی فعال نشود، ثبت‌نام به معنی احراز مالکیت شماره نیست.</p>
  </section><aside><div class="club-photo"><div class="club-badge">${icon('crown')}<b>THE COFFEE CLUB</b></div></div>
    <div class="glass mt"><h3>قرعه‌کشی چطوری انجام می‌شه؟</h3><p>مدیر از فهرست اعضا به‌صورت تصادفی یک نفر انتخاب می‌کنه. تاریخ، تعداد و نوع جوایز در صورت تصمیم به برگزاری، جداگانه اعلام خواهد شد. هر شماره فقط یک عضویت فعال دارد.</p></div>
  </aside></div></div>`);
  const form = document.getElementById('club-form'); if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('full_name') || '').trim();
    const phone = normalizePhone(String(data.get('phone') || '').trim());
    const telegram = String(data.get('telegram') || '').trim();
    if (name.length < 2 || name.length > 80 || !/^09\d{9}$/.test(phone) || (telegram && !/^@?[A-Za-z0-9_]{5,32}$/.test(telegram)) || !data.get('consent')) {
      toast('لطفاً نام، شماره موبایل و رضایت را بررسی کن. آیدی تلگرام هم باید معتبر باشد.',true); return;
    }
    if (!live) { toast('این پیش‌نمایش است؛ اطلاعاتت ذخیره نشد. ابتدا پایگاه داده را متصل کن.',true); return; }
    const btn = form.querySelector('button'); btn.disabled = true;
    try {
      const ok = await rpc('join_club',{p_name:name,p_phone:phone,p_telegram:telegram,p_consent:true});
      if (ok) { form.reset(); toast('درخواست عضویت دریافت شد. هر شماره فقط یک عضویت دارد.'); }
    } catch(error) { toast(`ثبت‌نام ناموفق بود: ${error.message}`,true); }
    finally { btn.disabled = false; }
  });
}
function renderCatalogError(error) {
  setMain(`<div class="shell page-hero"><div class="glass"><h1>اتصال برقرار نشد</h1><p>${esc(error.message)}</p><p>لطفاً دوباره تلاش کن.</p><button class="btn btn-primary" id="retry-connection">تلاش دوباره</button></div></div>`);
  document.getElementById('retry-connection').addEventListener('click', () => location.reload());
}

// Admin UI. In preview mode all settings are local and no PII is ever collected.
async function loadAdmin() {
  if (!live) {
    const comments = stored('uc_comments', []);
    const cfg = demoCatalog();
    return { drinks: cfg.drinks, settings: cfg.settings, comments, messages: [], members: [], draws: [],
      stats: { votes: cfg.drinks.reduce((a,d)=>a+d.total,0), comments_pending: comments.filter(c=>c.status==='pending').length, members: 0, messages: 0 } };
  }
  return await rpc('admin_data');
}
function loginView() {
  setMain(`${intro('PRIVATE DASHBOARD','پنل <span class="accent">مدیریت</span>','دسترسی این بخش فقط برای مدیر تأییدشده UniCafe فعال است.')}
    <div class="shell"><div class="glass login-wrap"><span class="tag">${icon('lock',16)} SECURE LOGIN</span><h2 style="margin-top:18px">ورود مدیر</h2>
    <form id="login-form"><div class="field"><label class="field-label" for="admin-email">ایمیل</label><input class="input" type="email" id="admin-email" name="email" autocomplete="username" required dir="ltr"></div>
    <div class="field"><label class="field-label" for="admin-password">رمز عبور</label><input class="input" type="password" id="admin-password" name="password" autocomplete="current-password" required dir="ltr"></div>
    <button class="btn btn-primary btn-full" type="submit">${icon('lock')} ورود امن</button></form><p class="help-row">ورود با حساب ایمیل تأییدشده‌ای که شناسه آن در جدول مدیران ثبت شده باشد امکان‌پذیر است.</p></div></div>`);
  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault(); const form = e.target, btn = form.querySelector('button'); btn.disabled = true;
    try {
      const result = await state.client.auth.signInWithPassword({email: form.email.value, password: form.password.value});
      if (result.error) throw result.error;
      state.admin = await loadAdmin(); renderAdmin(); toast('خوش اومدی.');
    } catch(error) { toast('ورود ناموفق بود یا دسترسی مدیریت نداری.',true); }
    finally { btn.disabled = false; }
  });
}
async function initAdmin() {
  if (!live) { state.admin = await loadAdmin(); renderAdmin(); return; }
  const { data: { user } } = await state.client.auth.getUser();
  if (user && !user.is_anonymous) {
    try { state.admin = await loadAdmin(); renderAdmin(); return; } catch { /* verified on server */ }
  }
  loginView();
}
function toggleSetting(k,label,v) {
  return `<label class="toggle-line">${esc(label)}<input type="checkbox" data-setting="${esc(k)}" ${v ? 'checked' : ''}></label>`;
}
function toggleDrink(code,k,label,v) {
  return `<label class="toggle-line">${esc(label)}<input type="checkbox" data-drink="${code}" data-key="${esc(k)}" ${v ? 'checked' : ''}></label>`;
}
function adminOverview(a) {
  const {stats} = a;
  return `<div class="admin-stat-grid">
    <div class="admin-stat"><b>${n(stats.votes)}</b><span>کل رأی‌ها</span></div><div class="admin-stat"><b>${n(stats.comments_pending)}</b><span>نظرات در انتظار تأیید</span></div>
    <div class="admin-stat"><b>${n(stats.members)}</b><span>اعضای باشگاه</span></div><div class="admin-stat"><b>${n(stats.messages)}</b><span>پیام‌های دریافتی</span></div>
  </div><div class="section two-col"><div class="glass"><h3>تنظیمات عمومی</h3><div class="switches">
    ${toggleSetting('polls_visible','نمایش نظرسنجی‌ها',a.settings.polls_visible)}
    ${toggleSetting('votes_enabled','دریافت رأی جدید',a.settings.votes_enabled)}
    ${toggleSetting('results_visible','نمایش نتایج عمومی',a.settings.results_visible)}
    ${toggleSetting('comments_visible','نمایش کامنت‌ها',a.settings.comments_visible)}
    ${toggleSetting('comments_enabled','دریافت کامنت جدید',a.settings.comments_enabled)}
    ${toggleSetting('club_enabled','پذیرش عضویت باشگاه',a.settings.club_enabled)}
    ${toggleSetting('leaderboard_enabled','نمایش محبوب‌ترین نوشیدنی‌ها',a.settings.leaderboard_enabled)}
  </div></div>
    <div class="glass"><h3>وضعیت سیستم</h3><p>داده‌های رأی و نظرات قبلی هنگام مخفی شدن حذف نمی‌شوند.</p><div class="notice ${live ? 'ok' : ''}">${live ? 'اتصال Supabase فعال است؛ تغییرات در سرور ذخیره می‌شوند.' : 'این پنل صرفاً پیش‌نمایش محلی است و ورود امن، داده عمومی و عضویت واقعی فعال نیست.'}</div><p class="fine">ثبت رأی بدون حساب کاربری با شناسه ناشناس مرورگر انجام می‌شود و مانع قطعی رأی چندباره از دستگاه‌های مختلف نیست.</p></div>
  </div>`;
}
function adminDrinks(a) {
  return `<div class="admin-toolbar"><h3>کنترل هر نوشیدنی</h3><span class="pill">۲۴ کد ثابت</span></div>`+categories.map(c => `<div class="cat-section"><div class="cat-title"><h2>${esc(c.fa)}</h2></div>${a.drinks.filter(d => d.category === c.id).map(d => `<div class="admin-drink"><strong dir="auto">${d.code} · ${esc(d.name)}</strong><small style="margin-right:12px">${n(d.total ?? 0)} رأی · ${n(d.likes ?? 0)} مثبت · ${n(d.dislikes ?? 0)} منفی</small><div class="switches">
    ${toggleDrink(d.code,'is_visible','نمایش نوشیدنی',d.is_visible)}
    ${toggleDrink(d.code,'votes_enabled','رأی‌گیری فعال',d.votes_enabled)}
    ${toggleDrink(d.code,'show_results','نتیجه عمومی',d.show_results)}
    ${toggleDrink(d.code,'comments_enabled','ثبت نظر',d.comments_enabled)}
    ${toggleDrink(d.code,'comments_visible','نمایش نظرات',d.comments_visible)}
  </div></div>`).join('')}</div>`).join('');
}
function adminComments(a) {
  if (!a.comments.length) return '<div class="empty-state">فعلاً نظری برای بررسی وجود ندارد.</div>';
  return `<div class="admin-list">${a.comments.map(c => `<article class="admin-item"><div class="row"><strong>${esc(c.name || 'ناشناس')} · ${c.code || c.drink_code}</strong><span class="pill ${esc(c.status)}">${c.status === 'pending' ? 'در انتظار' : c.status === 'approved' ? 'تأییدشده' : 'ردشده'}</span></div><small>${stamp(c.created_at)}</small><p>${esc(c.body)}</p><div class="actions">
    <button class="btn btn-ghost" data-moderate="approved" data-id="${c.id}">${icon('check',15)} تأیید</button>
    <button class="btn btn-ghost" data-moderate="rejected" data-id="${c.id}">رد نظر</button>
    <button class="btn btn-danger" data-moderate="delete" data-id="${c.id}">حذف</button>
  </div></article>`).join('')}</div>`;
}
function adminMessages(a) {
  return a.messages.length ? `<div class="admin-list">${a.messages.map(m => `<article class="admin-item"><small>${stamp(m.created_at)}</small><p>${esc(m.body)}</p></article>`).join('')}</div>` : '<div class="empty-state">پیامی دریافت نشده است.</div>';
}
function adminMembers(a) {
  return `<div class="admin-toolbar"><h3>مشتری‌های ویژه (${n(a.members.length)})</h3><button class="btn btn-ghost" data-export="members">${icon('download')} خروجی CSV</button></div>
  ${a.members.length ? `<div class="admin-list">${a.members.map(m => `<article class="admin-item"><div class="row"><strong>${esc(m.full_name)}</strong><small>${stamp(m.created_at)}</small></div><p dir="ltr" style="text-align:right">${esc(m.phone)}</p><small dir="ltr">${esc(m.telegram_id || 'بدون تلگرام')}</small><div class="actions"><button class="btn btn-danger" data-remove-member="${m.id}">حذف عضویت</button></div></article>`).join('')}</div>` : '<div class="empty-state">هنوز عضوی ثبت نشده است.</div>'}
  <section class="drawing mt"><h3>${icon('gift')} قرعه‌کشی تصادفی</h3><p>در هر قرعه‌کشی یک نفر به‌طور تصادفی از اعضایی انتخاب می‌شود که قبلاً برنده نشده‌اند. نتیجه برای ثبت سابقه ذخیره می‌شود.</p>
    <button class="btn btn-primary" data-draw="1" ${a.members.length ? '' : 'disabled'}>${icon('sparkle')} انتخاب برنده تصادفی</button>
    ${a.draws?.length ? `<h3 class="mt">تاریخچه برندگان</h3>${a.draws.map(d=>`<div class="admin-item"><b>${esc(d.full_name)}</b><p dir="ltr">${esc(d.phone)}</p><small>${stamp(d.drawn_at)}</small></div>`).join('')}` : ''}
    <div id="draw-result"></div>
  </section>`;
}
function adminSettings(a) {
  return `<div class="glass"><h3>اطلاعات پشتیبانی و تنظیمات</h3>
    <form id="settings-form"><div class="field"><label class="field-label">شماره تماس تکمیلی (اختیاری)</label><input class="input" name="support_phone" dir="ltr" placeholder="مثلاً 0912..." value="${esc(a.settings.support_phone)}"></div>
    <div class="field"><label class="field-label">واتساپ (شماره بین‌المللی)</label><input class="input" name="support_whatsapp" dir="ltr" placeholder="989121234567" value="${esc(a.settings.support_whatsapp)}"></div>
    <div class="field"><label class="field-label">ساعت پاسخگویی</label><input class="input" name="support_hours" maxlength="100" placeholder="اختیاری" value="${esc(a.settings.support_hours)}"></div>
    <button class="btn btn-primary" type="submit">${icon('check')} ذخیره اطلاعات</button></form>
    <p class="fine">شماره‌های اصلی بهرام ایمانی و مهدی قهرمانی در فایل app.js ثبت شده‌اند؛ فیلد شماره تماس اینجا، یک شماره تکمیلی اختیاری است.</p>
  </div>`;
}
function renderAdmin() {
  const a = state.admin;
  const tabs = [['overview','داشبورد'],['drinks','نوشیدنی‌ها'],['comments','تأیید نظرات'],['messages','پیام‌ها'],['members','باشگاه و قرعه‌کشی'],['settings','تنظیمات']];
  const views = {overview:adminOverview,drinks:adminDrinks,comments:adminComments,messages:adminMessages,members:adminMembers,settings:adminSettings};
  setMain(`${intro('PRIVATE AREA','مدیریت <span class="accent">UniCafe</span>','تنظیمات، آمار، نظرات و اعضای ویژه را از همین‌جا مدیریت کن.')}
    <div class="shell admin-page"><div class="admin-toolbar"><span class="tag">${icon('shield',14)} ${live ? 'اتصال فعال' : 'پیش‌نمایش آفلاین'}</span>${live ? `<button class="btn btn-ghost" id="logout">${icon('logout')} خروج</button>` : ''}</div>
    <div class="admin-tabs" role="tablist">${tabs.map(([id,label])=>`<button class="admin-tab ${state.adminTab === id ? 'active' : ''}" data-admin-tab="${id}">${label}</button>`).join('')}</div>
    <div id="admin-view">${views[state.adminTab](a)}</div></div>`);
  document.getElementById('logout')?.addEventListener('click', async () => { await state.client.auth.signOut(); loginView(); });
}
async function refreshAdmin() { state.admin = await loadAdmin(); renderAdmin(); }
async function adminChangeSetting(k,value,box) {
  box.disabled = true;
  try {
    if (live) await rpc('admin_set_setting',{p_key:k,p_value:String(value)});
    else {const cfg=stored('uc_settings',{});cfg[k]=value;save('uc_settings',cfg);}
    await refreshAdmin();toast('تنظیمات ذخیره شد.');
  } catch(error){box.checked=!value;box.disabled=false;toast('ذخیره تنظیمات ناموفق بود.',true);}
}
async function adminChangeDrink(code,key,value,box) {
  box.disabled = true;
  try {
    if (live) await rpc('admin_set_drink',{p_code:code,p_key:key,p_enabled:value});
    else {const f=stored('uc_drink_flags',{});f[code]={...defaultFlags,...f[code],[key]:value};save('uc_drink_flags',f);}
    await refreshAdmin();toast('وضعیت نوشیدنی ذخیره شد.');
  }catch(error){box.checked=!value;box.disabled=false;toast('تغییر وضعیت ناموفق بود.',true);}
}
async function moderate(id,action) {
  try {
    if(live) await rpc('admin_moderate_comment',{p_id:id,p_action:action});
    else {let c=stored('uc_comments',[]);c=action==='delete'?c.filter(x=>x.id!==id):c.map(x=>x.id===id?{...x,status:action}:x);save('uc_comments',c);}
    await refreshAdmin();toast('نظر به‌روزرسانی شد.');
  }catch(error){toast('تغییر وضعیت نظر ناموفق بود.',true);}
}
async function saveSettings(form) {
  const d = new FormData(form), fields=['support_phone','support_whatsapp','support_hours'];
  const values = fields.map(k=>[k,String(d.get(k)||'').trim()]);
  if(values[0][1].length>35||values[1][1].length>30||values[2][1].length>100) {toast('طول مقدارها بیشتر از حد مجاز است.',true);return;}
  try {
    if(live) { for(const [k,v] of values) await rpc('admin_set_setting',{p_key:k,p_value:v}); }
    else {const cfg=stored('uc_settings',{});for(const [k,v] of values)cfg[k]=v;save('uc_settings',cfg);}
    await refreshAdmin();toast('اطلاعات پشتیبانی ذخیره شد.');
  }catch(error){toast('ذخیره اطلاعات ناموفق بود.',true);}
}
function downloadCsv(members) {
  const headers=['name','phone','telegram','registered_at'];
  const row = arr => arr.map(v=>`"${String(v ?? '').replace(/^[\s\u0000-\u001f\uFEFF]*[=+@-]/,'\' $&').replace(/"/g,'""')}"`).join(',');
  const csv='\ufeff'+[headers,...members.map(m=>[m.full_name,m.phone,m.telegram_id,m.created_at])].map(row).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  const a=document.createElement('a');a.href=url;a.download='unicafe-club.csv';a.click();URL.revokeObjectURL(url);
}
async function removeMember(id) {
  if (!confirm('عضویت این شخص حذف شود؟ این عملیات قابل بازگشت نیست.')) return;
  try { if(live) await rpc('admin_delete_member',{p_id:id}); await refreshAdmin(); toast('عضویت حذف شد.'); }
  catch(error) { toast('حذف عضویت ناموفق بود.',true); }
}
async function draw() {
  if (!live) {toast('قرعه‌کشی واقعی فقط بعد از اتصال پایگاه داده فعال می‌شود.',true);return;}
  if (!confirm('یک برنده تصادفی انتخاب و در تاریخچه ثبت شود؟')) return;
  try {
    const winner = await rpc('admin_draw_winner');
    await refreshAdmin();
    const box=document.getElementById('draw-result');
    if(box)box.innerHTML=`<div class="drawing-result"><strong>برنده انتخاب شد: ${esc(winner.full_name)}</strong><p dir="ltr">${esc(winner.phone)}</p></div>`;
    toast('قرعه‌کشی انجام و ثبت شد.');
  }catch(error){toast(`قرعه‌کشی انجام نشد: ${error.message}`,true);}
}
function events() {
  const main=document.getElementById('page-main');
  main.addEventListener('click',async e=>{
    const v=e.target.closest('[data-vote]');if(v){await vote(Number(v.dataset.code),Number(v.dataset.vote),v);return;}
    const c=e.target.closest('[data-comments]');if(c){await toggleComments(Number(c.dataset.comments));return;}
    const tab=e.target.closest('[data-admin-tab]');if(tab){state.adminTab=tab.dataset.adminTab;renderAdmin();return;}
    const mod=e.target.closest('[data-moderate]');if(mod){await moderate(mod.dataset.id,mod.dataset.moderate);return;}
    const del=e.target.closest('[data-remove-member]');if(del){await removeMember(del.dataset.removeMember);return;}
    if(e.target.closest('[data-export]')){downloadCsv(state.admin.members);return;}
    if(e.target.closest('[data-draw]')){await draw();}
    const cp = e.target.closest('[data-copy-phone]');if(cp){
      const number=cp.dataset.copyPhone;
      try {
        if(navigator.clipboard?.writeText && window.isSecureContext) await navigator.clipboard.writeText(number);
        else {const area=document.createElement('textarea');area.value=number;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();if(!document.execCommand('copy'))throw new Error('copy failed');area.remove();}
        toast('شماره کپی شد.');
      } catch {toast('کپی نشد؛ شماره را لمس طولانی کن.',true);} return;
    }
  });
  main.addEventListener('change',async e=>{
    const input=e.target;
    if(input.matches('[data-setting]')) await adminChangeSetting(input.dataset.setting,input.checked,input);
    if(input.matches('[data-drink]')) await adminChangeDrink(Number(input.dataset.drink),input.dataset.key,input.checked,input);
  });
  main.addEventListener('submit',async e=>{
    const form=e.target;
    if(form.matches('[data-comment-form]')) {e.preventDefault();await submitComment(form);}
    if(form.id==='settings-form'){e.preventDefault();await saveSettings(form);}
  });
}
async function main() {
  renderShell();events();
  const openMenu = () => {
    const drawer = document.getElementById('mobile-drawer');
    document.querySelector('.mobile-drawer-backdrop').hidden = false;
    drawer.inert = false;
    drawer.classList.add('is-open');
    document.querySelector('.mobile-menu-trigger').setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  };
  const closeMenu = () => {
    const drawer = document.getElementById('mobile-drawer');
    drawer.classList.remove('is-open');
    drawer.inert = true;
    document.querySelector('.mobile-drawer-backdrop').hidden = true;
    document.querySelector('.mobile-menu-trigger').setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };
  document.querySelector('.mobile-menu-trigger').addEventListener('click', openMenu);
  document.querySelector('.mobile-menu-close').addEventListener('click', closeMenu);
  document.querySelector('.mobile-drawer-backdrop').addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  if(page==='about'){renderAbout();return;}
  if(page==='index'){renderHome();return;}
  try {
    await initBackend();
    if(page==='admin'){await initAdmin();return;}
    setMain('<div class="shell page-hero" role="status">در حال دریافت اطلاعات…</div>');
    await loadCatalog();
    if(page==='drinks') {
      renderDrinks();
      if(live) setInterval(async () => {
        if(document.hidden || document.activeElement?.matches('input, textarea') || state.openComments.size) return;
        try { await loadCatalog(); updateDrinkList(); } catch { /* retain last usable result */ }
      }, 30000);
    }
    if(page==='club')renderClub();
    if(page==='contact') { renderContact(); if(location.hash === '#message') document.getElementById('message')?.scrollIntoView(); }
  }catch(error){
    if(page==='contact'){renderContact();toast('اتصال به پایگاه داده برقرار نیست؛ شماره‌های تماس همچنان قابل استفاده‌اند.',true);}
    else renderCatalogError(error);
  }
}
main();
