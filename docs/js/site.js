/* LuniOS website - small, dependency free (GitHub Pages friendly). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FEED = 'https://raw.githubusercontent.com/project-patina/lunios-updates/main/akita.json';
  const RELEASES = 'https://github.com/project-patina/lunios-updates/releases';

  const DYN = { notes: 'Show notes', err: 'Could not load releases right now.', none: 'No releases on this channel yet.', stable: 'Stable', all: 'All releases on GitHub' };

  /* ---------------- nav: sliding pill + mobile menu ---------------- */
  const links = $('#links'), pill = $('.pill', links);
  const current = () => $('a[aria-current="page"]', links);
  function movePill(to) {
    const a = to || current();
    if (!a || !pill || getComputedStyle(pill).display === 'none') return;
    pill.style.left = a.offsetLeft + 'px';
    pill.style.width = a.offsetWidth + 'px';
    pill.style.opacity = '1';
  }
  $$('a', links).forEach((a) => {
    a.addEventListener('mouseenter', () => movePill(a));
    a.addEventListener('focus', () => movePill(a));
  });
  links.addEventListener('mouseleave', () => movePill());
  addEventListener('resize', () => movePill());
  const menu = $('#menu');
  menu.addEventListener('click', () => {
    const open = !links.classList.contains('open');
    links.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
  });

  /* ---------------- scroll reveal ---------------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -30px' });
  $$('.rv').forEach((el) => io.observe(el));
  const phones = $('#hero-phones');
  if (phones) requestAnimationFrame(() => setTimeout(() => phones.classList.add('in'), 150));

  /* ---------------- gallery: buttons, drag, wheel ---------------- */
  const gal = $('#gallery');
  if (gal) {
    const step = () => (gal.querySelector('figure')?.offsetWidth || 240) + 26;
    const prev = $('#gal-prev'), next = $('#gal-next');
    const upd = () => { prev.disabled = gal.scrollLeft < 8; next.disabled = gal.scrollLeft > gal.scrollWidth - gal.clientWidth - 8; };
    prev.addEventListener('click', () => gal.scrollBy({ left: -step() * 2, behavior: 'smooth' }));
    next.addEventListener('click', () => gal.scrollBy({ left: step() * 2, behavior: 'smooth' }));
    gal.addEventListener('scroll', upd, { passive: true });
    let sx = 0, sl = 0, down = false, moved = false;
    gal.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = gal.scrollLeft; });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; gal.classList.add('drag'); }
      gal.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return; down = false;
      if (moved) {
        const s = step(), target = Math.round(gal.scrollLeft / s) * s;
        gal.classList.remove('drag');
        gal.scrollTo({ left: target, behavior: 'smooth' });
      }
    });
    upd();
  }

  /* ---------------- releases from the OTA feed ---------------- */
  let releases = null, failed = false, filter = 'all';
  const T = (k) => DYN[k];
  const pretty = (v) => v.replace(/-beta$/i, ' beta');
  const date = (ts) => new Date(ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const size = (b) => (b / 1e9).toFixed(2) + ' GB';
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function md(src) {
    const out = []; let list = false;
    const inl = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
    String(src || '').split('\n').forEach((raw, i) => {
      const line = raw.trimEnd(), li = line.match(/^\s*[-*]\s+(.*)/);
      if (li) { if (!list) { out.push('<ul>'); list = true; } out.push(`<li>${inl(li[1])}</li>`); return; }
      if (list) { out.push('</ul>'); list = false; }
      const h = line.match(/^(#{1,4})\s+(.*)/);
      if (h) { if (!(i === 0 && h[1].length <= 2)) out.push(`<h4>${inl(h[2])}</h4>`); return; }
      if (line.trim()) out.push(`<p>${inl(line)}</p>`);
    });
    if (list) out.push('</ul>');
    return out.join('');
  }
  const tagFor = (r) => (r.romtype === 'BETA' ? '<span class="pill-tag beta">Beta</span>' : `<span class="pill-tag">${T('stable')}</span>`);
  const pageFor = (r) => r.url.replace(/\/download\/([^/]+)\/.*$/, '/tag/$1');

  function renderReleases() {
    const feed = $('#feed');
    if (failed) {
      if (feed) feed.innerHTML = `<p class="muted">${T('err')} <a href="${RELEASES}" style="color:var(--accent)">${T('all')} →</a></p>`;
      return;
    }
    if (!releases) return;
    const newest = releases[0];
    const badge = $('#hero-badge-text');
    if (badge && newest) badge.textContent = 'LuniOS ' + pretty(newest.version);
    const devLatest = $('#dev-latest');
    if (devLatest && newest) devLatest.textContent = pretty(newest.version);
    ['RELEASE', 'BETA'].forEach((type) => {
      const card = $('#ch-' + type), r = releases.find((x) => x.romtype === type);
      if (!card || !r) return;
      $('.v', card).textContent = pretty(r.version);
      $('.meta', card).textContent = `${date(r.datetime)} · ${size(r.size)}`;
      $('.dl', card).href = r.url;
      $('.page', card).href = pageFor(r);
    });
    if (!feed) return;
    const list = releases.filter((r) => filter === 'all' || r.romtype === filter);
    feed.innerHTML = list.length ? list.map((r, i) => `
      <article class="rel">
        <div class="rel-top"><b>LuniOS ${esc(pretty(r.version))}</b>${tagFor(r)}<time>${date(r.datetime)}</time></div>
        ${i === 0 ? `<div class="rel-body">${md(r.changelog)}</div>` : `<details><summary>${T('notes')}</summary><div class="rel-body">${md(r.changelog)}</div></details>`}
      </article>`).join('') : `<p class="muted">${T('none')}</p>`;
  }
  $$('#feed-tabs button').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.c;
    $$('#feed-tabs button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    if (document.startViewTransition && !reduce) document.startViewTransition(renderReleases); else renderReleases();
  }));
  if ($('#feed') || $('#hero-badge-text') || $('#dev-latest')) {
    fetch(FEED + '?t=' + Math.floor(Date.now() / 300000), { cache: 'no-store' })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((j) => { releases = (j.response || []).slice().sort((a, b) => b.datetime - a.datetime); renderReleases(); })
      .catch(() => { failed = true; renderReleases(); });
  }

  renderReleases();
  movePill();
})();
