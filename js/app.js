(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const KEY = 'kexplore.registrations';
  const THEME = 'kexplore.theme';
  const CATEGORIES = ['All', ...new Set(EVENTS.map(e => e.category))];
  const state = { category: 'All', query: '' };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const byId = id => EVENTS.find(e => e.id === id);
  const upcoming = () => EVENTS.filter(e => new Date(e.date) > new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const fmtDate = iso => new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const fmtTime = iso => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  const imgUrl = (seed, w = 640, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

  /* ---------- storage ---------- */
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage blocked */ } };

  /* ---------- theme ---------- */
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    $('#themeIcon').textContent = t === 'dark' ? '☀' : '☾';
    $('#themeToggle').setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    try { localStorage.setItem(THEME, t); } catch { /* ignore */ }
  }
  $('#themeToggle').addEventListener('click', () =>
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  setTheme(document.documentElement.dataset.theme || 'light');

  /* ---------- mobile nav ---------- */
  $('#navToggle').addEventListener('click', e => {
    const open = $('#navList').classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', open);
  });
  $('#navList').addEventListener('click', () => {
    $('#navList').classList.remove('open');
    $('#navToggle').setAttribute('aria-expanded', 'false');
  });

  /* ---------- countdown ---------- */
  function countdownHTML(iso) {
    const diff = new Date(iso) - new Date();
    if (diff <= 0) return '<p class="live">This event has started</p>';
    const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24,
      m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
    return [['days', d], ['hrs', h], ['min', m], ['sec', s]]
      .map(([l, v]) => `<div><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
  }
  function tick() {
    document.querySelectorAll('[data-countdown-box][data-date]').forEach(el => { el.innerHTML = countdownHTML(el.dataset.date); });
  }
  setInterval(tick, 1000);

  /* ---------- hero ticket ---------- */
  function renderNext() {
    const next = upcoming()[0];
    if (!next) {
      $('#nextTitle').textContent = 'No upcoming events';
      $('#nextMeta').textContent = 'Check back soon.';
      $('#nextBtn').hidden = true;
      return;
    }
    $('#nextTitle').textContent = next.title;
    $('#nextMeta').textContent = `${fmtDate(next.date)}, ${fmtTime(next.date)} at ${next.venue}`;
    $('#nextCountdown').dataset.date = next.date;
    $('#nextBtn').onclick = () => openDialog(next.id);
    tick();
  }

  /* ---------- filters + grid ---------- */
  function renderChips() {
    $('#chips').innerHTML = CATEGORIES.map(c =>
      `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${c === state.category}">${esc(c)}</button>`).join('');
  }
  function filtered() {
    const q = state.query.trim().toLowerCase();
    return upcoming().filter(e =>
      (state.category === 'All' || e.category === state.category) &&
      (!q || [e.title, e.venue, e.category, e.short].join(' ').toLowerCase().includes(q)));
  }
  function renderGrid() {
    const list = filtered();
    $('#eventGrid').innerHTML = list.map(e => `
      <article class="card" data-cat="${esc(e.category)}">
        <button class="card-btn" type="button" data-open="${e.id}" aria-label="View details for ${esc(e.title)}">
          <img src="${imgUrl(e.img)}" alt="" loading="lazy" width="640" height="400">
          <div class="card-body">
            <p class="badge">${esc(e.category)}</p>
            <h3>${esc(e.title)}</h3>
            <p class="meta">${fmtDate(e.date)}, ${fmtTime(e.date)}</p>
            <p class="meta">${esc(e.venue)}</p>
            <p class="desc">${esc(e.short)}</p>
            <p class="price">${esc(e.price)}</p>
          </div>
        </button>
      </article>`).join('');
    $('#empty').hidden = list.length > 0;
    $('#resultCount').textContent = `${list.length} event${list.length === 1 ? '' : 's'}`;
  }
  $('#chips').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    state.category = b.dataset.cat; renderChips(); renderGrid();
  });
  $('#search').addEventListener('input', e => { state.query = e.target.value; renderGrid(); });
  $('#clearFilters').addEventListener('click', () => {
    state.category = 'All'; state.query = ''; $('#search').value = ''; renderChips(); renderGrid();
  });
  $('#eventGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-open]'); if (b) openDialog(b.dataset.open);
  });
  // Mark images that fail to load so CSS can show a plain block instead
  document.addEventListener('error', e => {
    if (e.target.tagName === 'IMG') e.target.classList.add('img-fail');
  }, true);

  /* ---------- details dialog ---------- */
  const dlg = $('#eventDialog');
  let dlgEvent = null;
  function openDialog(id) {
    const e = byId(id); if (!e) return;
    dlgEvent = e;
    $('#dlgImg').src = imgUrl(e.img, 900, 420);
    $('#dlgCat').textContent = e.category;
    $('#dlgTitle').textContent = e.title;
    $('#dlgWhen').textContent = `${fmtDate(e.date)}, ${fmtTime(e.date)}`;
    $('#dlgWhere').textContent = e.venue;
    $('#dlgPrice').textContent = e.price;
    const taken = load().filter(r => r.eventId === e.id).length;
    $('#dlgSeats').textContent = `${Math.max(e.seats - taken, 0)} of ${e.seats} left`;
    $('#dlgDesc').textContent = e.description;
    $('#dlgCountdown').dataset.date = e.date;
    tick();
    dlg.showModal();
  }
  $('#dlgClose').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  $('#dlgRegister').addEventListener('click', () => {
    dlg.close();
    $('#eventSelect').value = dlgEvent.id;
    $('#confirm').hidden = true; $('#regForm').hidden = false;
    $('#register').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => $('#name').focus({ preventScroll: true }), 400);
  });

  /* ---------- registration form ---------- */
  const form = $('#regForm');
  function fillSelect() {
    $('#eventSelect').innerHTML = '<option value="">Choose an event</option>' +
      upcoming().map(e => `<option value="${e.id}">${esc(e.title)} (${fmtDate(e.date)})</option>`).join('');
  }
  const rules = {
    name: v => !v.trim() ? 'Enter your full name.'
      : !/^[A-Za-z][A-Za-z .'-]{1,59}$/.test(v.trim()) ? 'Use letters only, at least 2 characters.' : '',
    email: v => !v.trim() ? 'Enter your email address.'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Enter a valid email, like name@example.com.' : '',
    phone: v => {
      const d = v.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');
      return !v.trim() ? 'Enter your phone number.'
        : !/^[6-9]\d{9}$/.test(d) ? 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.' : '';
    },
    event: v => v ? '' : 'Choose the event you want to attend.'
  };
  function check(field) {
    const msg = rules[field](form.elements[field].value);
    $(`[data-error-for="${field}"]`).textContent = msg;
    form.elements[field].setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  Object.keys(rules).forEach(f => {
    form.elements[f].addEventListener('blur', () => check(f));
    form.elements[f].addEventListener('input', () => { if (form.elements[f].getAttribute('aria-invalid') === 'true') check(f); });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const results = Object.keys(rules).map(check);
    if (results.includes(false)) {
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    const data = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim().toLowerCase(),
      phone: form.elements.phone.value.replace(/[\s-]/g, ''),
      eventId: form.elements.event.value
    };
    const list = load();
    if (list.some(r => r.email === data.email && r.eventId === data.eventId)) {
      $('[data-error-for="email"]').textContent = 'This email is already registered for this event.';
      form.elements.email.setAttribute('aria-invalid', 'true');
      form.elements.email.focus();
      return;
    }
    const ev = byId(data.eventId);
    const reg = { ...data, id: 'KX-' + Math.random().toString(36).slice(2, 8).toUpperCase(), at: new Date().toISOString() };
    list.push(reg); save(list);
    $('#confirmText').textContent = `${data.name}, you're booked for ${ev.title} on ${fmtDate(ev.date)} at ${fmtTime(ev.date)}. A copy of your ticket is under My tickets.`;
    $('#confirmId').textContent = reg.id;
    form.hidden = true; $('#confirm').hidden = false;
    form.reset();
    Object.keys(rules).forEach(f => form.elements[f].setAttribute('aria-invalid', 'false'));
    renderTickets();
    $('#confirm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('#againBtn').addEventListener('click', () => { $('#confirm').hidden = true; form.hidden = false; $('#name').focus(); });

  /* ---------- my tickets ---------- */
  function renderTickets() {
    const list = load();
    $('#myEmpty').hidden = list.length > 0;
    $('#clearAll').hidden = list.length === 0;
    $('#myList').innerHTML = list.map(r => {
      const e = byId(r.eventId); if (!e) return '';
      return `<li class="my-ticket">
        <div><h3>${esc(e.title)}</h3>
        <p class="meta">${fmtDate(e.date)}, ${fmtTime(e.date)} · ${esc(e.venue)}</p>
        <p class="meta">${esc(r.name)} · ${esc(r.email)}</p></div>
        <div class="my-side"><span class="tid">${esc(r.id)}</span>
        <button class="btn btn-ghost small" type="button" data-cancel="${esc(r.id)}">Cancel</button></div></li>`;
    }).join('');
  }
  $('#myList').addEventListener('click', e => {
    const b = e.target.closest('[data-cancel]'); if (!b) return;
    if (confirm('Cancel this registration?')) { save(load().filter(r => r.id !== b.dataset.cancel)); renderTickets(); }
  });
  $('#clearAll').addEventListener('click', () => {
    if (confirm('Remove all your registrations from this browser?')) { save([]); renderTickets(); }
  });

  /* ---------- init ---------- */
  renderNext(); renderChips(); renderGrid(); fillSelect(); renderTickets(); tick();
})();
