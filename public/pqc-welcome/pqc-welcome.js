/*
 * PQC welcome page: shared behaviour for pqc-welcome.html (es) and
 * pqc-welcome.en.html (en). Each page defines window.PQC_I18N with its texts
 * and window.PQC_PARAMS (parsed from the URL hash by the inline head script).
 *
 * Hash parameters:
 *   embed           running inside the docs (PqcWelcome component)
 *   theme=dark|light (or the legacy #dark / #light)
 *   docs=<prefix>   prefix for links into the docs, e.g. /docs/es
 *
 * Messages exchanged with the embedding page (same origin only):
 *   → pqc-welcome:height  { height }   document height, on every resize
 *   → pqc-welcome:scroll  { top }      scroll the parent to this offset
 *   ← pqc-welcome:theme   { theme }    follow the site's theme switch
 */
(() => {
'use strict';
const S = window.PQC_I18N;
const P = window.PQC_PARAMS || {};
const EMBED = 'embed' in P && window.parent !== window;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const announce = (msg) => { const a = $('#announcer'); a.textContent = ''; requestAnimationFrame(() => { a.textContent = msg; }); };

/* ───────────────────────── Embedding ───────────────────────── */
function scrollToEl(el) {
  if (EMBED) {
    window.parent.postMessage({ type: 'pqc-welcome:scroll', top: el.getBoundingClientRect().top + window.scrollY }, location.origin);
  } else {
    el.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }
}
// In-page anchors: inside the docs the iframe never scrolls, so the parent must.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href') === '#') return;
  const target = document.getElementById(a.getAttribute('href').slice(1));
  if (!target) return;
  e.preventDefault();
  scrollToEl(target);
});
// Links into the docs follow the embedding page's locale and base path.
const docsBase = (P.docs || S.docsBase).replace(/\/+$/, '');
$$('a[data-doc]').forEach((a) => { a.href = docsBase + a.dataset.doc; });
if (EMBED) {
  const post = () => window.parent.postMessage({ type: 'pqc-welcome:height', height: document.documentElement.scrollHeight }, location.origin);
  new ResizeObserver(post).observe(document.body);
  post();
  window.addEventListener('message', (e) => {
    if (e.source !== window.parent || e.origin !== location.origin) return;
    if (e.data?.type === 'pqc-welcome:theme' && (e.data.theme === 'dark' || e.data.theme === 'light')) {
      document.documentElement.setAttribute('data-theme', e.data.theme);
    }
  });
}

/* ───────────────────────── Data ───────────────────────── */
const KEX = {
  'T':    { groups: ['X25519', 'CurveP256', 'CurveP384'], neg: 'X25519' },
  'PQ':   { groups: ['MLKEM1024'], neg: 'MLKEM1024' },
  'PQ/T': { groups: ['X25519MLKEM768', 'SecP256r1MLKEM768', 'SecP384r1MLKEM1024'], neg: 'X25519MLKEM768' },
};
const AUTH = {
  'T':  { cert: 'ECDSA P-256', secret: 'edge-cert', scheme: 'ecdsa_secp256r1_sha256', origin: S.origin.T },
  'PQ': { cert: 'ML-DSA-65', secret: 'edge-cert-pq', scheme: 'mldsa65', origin: S.origin.PQ },
};
const VARIANTS = [
  { alg: 'MLDSA65-RSA3072-PSS-SHA512', scheme: 'mldsa65_rsa3072_pss', cp: '0xFE02', main: true },
  { alg: 'MLDSA44-ECDSA-P256-SHA256', scheme: 'mldsa44_ecdsa_p256', cp: '0xFE08' },
  { alg: 'MLDSA65-ECDSA-P256-SHA512', scheme: 'mldsa65_ecdsa_p256', cp: '0xFE09' },
  { alg: 'MLDSA65-Ed25519-SHA512', scheme: 'mldsa65_ed25519', cp: '0xFE0E' },
];
const authInfo = (auth, vi) => {
  if (auth !== 'PQ/T') return AUTH[auth];
  const v = VARIANTS[vi];
  return {
    cert: `Composite ${v.alg}`,
    secret: v.main ? 'edge-cert-pqt' : S.secretExtra,
    scheme: v.scheme,
    origin: v.main ? S.origin.PQTmain : S.origin.PQTextra,
    cp: v.cp, main: v.main,
  };
};

/* ───────────────────────── Why now ───────────────────────── */
(function lifetime() {
  const input = $('#life'), out = $('#life-out'), bar = $('#life-bar'), verdict = $('#life-verdict');
  const year = new Date().getFullYear();
  const update = () => {
    const n = +input.value;
    out.textContent = S.years(n);
    bar.style.width = `${Math.min(100, (n / 20) * 100)}%`;
    verdict.innerHTML = S.verdict(year + n, n);
  };
  input.addEventListener('input', update);
  update();
})();

/* ───────────────────────── Configurator ───────────────────────── */
const form = $('#config-form');
const variantSel = $('#variant');
VARIANTS.forEach((v, i) => variantSel.add(new Option(v.alg + (v.main ? S.installerSuffix : ''), String(i))));

function renderConfig() {
  const kex = form.elements.kex.value;
  const auth = form.elements.auth.value;
  const vi = +variantSel.value || 0;
  variantSel.disabled = auth !== 'PQ/T';
  const K = KEX[kex], A = authInfo(auth, vi);
  const tested = !(auth === 'PQ/T' && !A.main && kex !== 'PQ/T');
  const minTls = (kex === 'T' && auth === 'T') ? '1.2' : '1.3';

  $('#lane-kex').dataset.f = kex; $('#lane-auth').dataset.f = auth;
  $('#w-kex').textContent = `${kex} · ${K.neg}`;
  $('#w-auth').textContent = `${auth} · ${A.scheme}`;
  $('#r-group').textContent = K.neg;
  $('#r-scheme').textContent = A.scheme;
  $('#r-tls').textContent = `TLS ${minTls}`;
  $('#r-groups').innerHTML = K.groups.map((g) => `<code>${esc(g)}</code>`).join('');
  $('#r-cert').textContent = A.cert;
  $('#r-secret').textContent = A.secret;
  $('#r-origin').textContent = A.origin;
  $('#r-tests').innerHTML = tested ? S.testsOk(esc(K.neg), esc(A.scheme)) : S.testsUntested;

  $('#c-fastlane').textContent = `./scripts/lamassu-fast-lane.sh -d lab.example.com \\\n  --tls-kex ${kex} --tls-auth ${auth}`;
  const prefix = auth === 'PQ/T' ? 'OPENSSL_CONF=hybrid.cnf ' : '';
  $('#c-openssl').textContent =
`${prefix}openssl s_client -connect <LAMASSU_HOST>:443 -servername <LAMASSU_HOST> \\
  -tls1_3 -groups ${K.neg} -sigalgs ${A.scheme} \\
  -CAfile ca.pem -verify_hostname <LAMASSU_HOST> -verify_return_error \\
  < /dev/null 2>&1 | grep -E 'Negotiated TLS1.3 group|Peer signature type|Verify return code'`;

  const notes = [];
  if (auth === 'PQ/T') notes.push(S.notes.composite(esc(A.cp)));
  if (auth === 'PQ') notes.push(S.notes.mldsa);
  if (kex !== 'PQ/T') notes.push(S.notes.hrr);
  if (kex === 'T' && auth === 'T') notes.push(S.notes.classic);
  $('#r-notes').innerHTML = notes.join('');
}
form.addEventListener('change', renderConfig);
variantSel.addEventListener('change', renderConfig);
renderConfig();

// Hero cards preset the configurator
$$('[data-set]').forEach((btn) => btn.addEventListener('click', () => {
  const [dim, val] = btn.dataset.set.split(':');
  const radio = form.querySelector(`input[name="${dim}"][value="${val}"]`);
  radio.checked = true;
  renderConfig();
  scrollToEl($('#configurador'));
  radio.focus({ preventScroll: true });
}));

/* ───────────────────────── Architecture ───────────────────────── */
const arch = $('#arch');
function selectNode(key) {
  $$('.nd', arch).forEach((n) => n.setAttribute('aria-pressed', String(n.dataset.node === key)));
  const n = S.nodes[key];
  const action = n.go.tab
    ? `<button class="btn primary" type="button" data-open-tab="${n.go.tab}">${esc(n.go.label)} →</button>`
    : `<a class="btn primary" href="${n.go.href}" style="text-decoration:none">${esc(n.go.label)} →</a>`;
  $('#arch-detail').innerHTML = `<div><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p><ul>${n.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div><div>${action}</div>`;
}
$$('.nd', arch).forEach((n) => {
  n.addEventListener('click', () => selectNode(n.dataset.node));
  n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectNode(n.dataset.node); } });
});
selectNode('traefik');
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-open-tab]');
  if (!b) return;
  selectTab($('#' + b.dataset.openTab));
  scrollToEl($('#piezas'));
});

/* ───────────────────────── Tabs (WAI-ARIA, selection follows focus) ───────────────────────── */
const tabs = $$('#pieces [role="tab"]');
function selectTab(tab, focus = false) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    $(`[aria-labelledby="${t.id}"]`).hidden = !on;
  });
  if (focus) tab.focus({ preventScroll: true });
  // Scroll only the tab list, never the page.
  const list = tab.parentElement;
  const l = tab.offsetLeft - list.offsetLeft, r = l + tab.offsetWidth;
  if (l < list.scrollLeft) list.scrollLeft = l;
  else if (r > list.scrollLeft + list.clientWidth) list.scrollLeft = r - list.clientWidth;
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', (e) => {
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = tabs.length - 1;
    if (j !== null) { e.preventDefault(); selectTab(tabs[j], true); }
  });
});

/* Gallery */
const track = $('#gallery .track');
$$('[data-gal]').forEach((b) => b.addEventListener('click', () => {
  track.scrollBy({ left: +b.dataset.gal * track.clientWidth * 0.82, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
}));

/* Terminal mock */
const term = $('#term');
let termTimer = null;
function renderTerm(n) {
  term.innerHTML = S.term.slice(0, n).map(([c, t]) => `<span class="${c}">${esc(t)}</span>`).join('\n');
}
$('#term-play').addEventListener('click', () => {
  clearInterval(termTimer);
  if (reduceMotion.matches) { renderTerm(S.term.length); return; }
  let i = 0; renderTerm(0);
  termTimer = setInterval(() => { renderTerm(++i); if (i >= S.term.length) clearInterval(termTimer); }, 420);
});
renderTerm(S.term.length);

/* ───────────────────────── Algorithm explorer ───────────────────────── */
const ALGOS = [];
[['RSA', '2048 · 3072 · 4096'], ['ECDSA', '256 · 384 · 521'], ['Ed25519', '256']].forEach(([n, s]) =>
  ALGOS.push({ f: 'T', name: n, type: n, size: s, oid: S.algo.standard, sig: '—', tls: 'std' }));
[['ML-DSA-44', 44, 17, 2, 2420, '0x0904'], ['ML-DSA-65', 65, 18, 3, 3309, '0x0905'], ['ML-DSA-87', 87, 19, 5, 4627, '0x0906']].forEach(([n, s, o, cat, sig, cp]) =>
  ALGOS.push({ f: 'PQ', name: n, type: 'ML-DSA', size: String(s), oid: `2.16.840.1.101.3.4.3.${o}`, sig: S.bytes(sig), tls: cp, extra: S.algo.nistCat(cat) }));
[
  [1, 'SHA2-128s', 20, 7856], [2, 'SHAKE-128s', 26, 7856], [3, 'SHA2-128f', 21, 17088], [4, 'SHAKE-128f', 27, 17088],
  [5, 'SHA2-192s', 22, 16224], [6, 'SHAKE-192s', 28, 16224], [7, 'SHA2-192f', 23, 35664], [8, 'SHAKE-192f', 29, 35664],
  [9, 'SHA2-256s', 24, 29792], [10, 'SHAKE-256s', 30, 29792], [11, 'SHA2-256f', 25, 49856], [12, 'SHAKE-256f', 31, 49856],
].forEach(([id, n, o, sig]) => ALGOS.push({ f: 'PQ', name: `SLH-DSA-${n}`, type: 'SLH-DSA', size: String(id), oid: `2.16.840.1.101.3.4.3.${o}`, sig: S.bytes(sig), tls: null }));
[
  [1, 'MLDSA44-RSA2048-PSS-SHA256', 37, 'FE00', 'RSA'], [2, 'MLDSA44-RSA2048-PKCS15-SHA256', 38, 'FE01', 'RSA', true],
  [3, 'MLDSA65-RSA3072-PSS-SHA512', 41, 'FE02', 'RSA'], [4, 'MLDSA65-RSA3072-PKCS15-SHA512', 42, 'FE03', 'RSA', true],
  [5, 'MLDSA65-RSA4096-PSS-SHA512', 43, 'FE04', 'RSA'], [6, 'MLDSA65-RSA4096-PKCS15-SHA512', 44, 'FE05', 'RSA', true],
  [7, 'MLDSA87-RSA3072-PSS-SHA512', 52, 'FE06', 'RSA'], [8, 'MLDSA87-RSA4096-PSS-SHA512', 53, 'FE07', 'RSA'],
  [9, 'MLDSA44-ECDSA-P256-SHA256', 40, 'FE08', 'ECDSA'], [10, 'MLDSA65-ECDSA-P256-SHA512', 45, 'FE09', 'ECDSA'],
  [11, 'MLDSA65-ECDSA-P384-SHA512', 46, 'FE0A', 'ECDSA'], [12, 'MLDSA87-ECDSA-P384-SHA512', 49, 'FE0B', 'ECDSA'],
  [13, 'MLDSA87-ECDSA-P521-SHA512', 54, 'FE0C', 'ECDSA'], [14, 'MLDSA44-Ed25519-SHA512', 39, 'FE0D', 'Ed25519'],
  [15, 'MLDSA65-Ed25519-SHA512', 48, 'FE0E', 'Ed25519'],
].forEach(([s, n, o, cp, fam, chainOnly]) => ALGOS.push({
  f: 'PQ/T', name: n, type: `Composite-ML-DSA-${fam}`, size: String(s), oid: `1.3.6.1.5.5.7.6.${o}`, sig: S.algo.sigComposite,
  tls: `0x${cp}`, chainOnly,
}));

const tbody = $('#algo-table tbody');
function renderAlgos() {
  const fam = $('input[name="fam"]:checked').value;
  const tlsOnly = $('#tls-only').checked;
  const q = $('#algo-q').value.trim().toLowerCase();
  const rows = ALGOS.filter((a) =>
    (fam === 'all' || a.f === fam) &&
    (!tlsOnly || (a.tls && !a.chainOnly)) &&
    (!q || `${a.name} ${a.type} ${a.size} ${a.oid}`.toLowerCase().includes(q)));
  tbody.innerHTML = rows.map((a) => {
    const tls = !a.tls ? `<span class="warn">✗ ${S.algo.noTls}</span>`
      : a.chainOnly ? `<code>${a.tls}</code> <span class="warn">${S.algo.chainOnly}</span>`
      : a.tls === 'std' ? `<span class="ok">✓</span> ${S.algo.standard}`
      : `<span class="ok">✓</span> <code>${a.tls}</code>`;
    return `<tr><td><span class="fam" data-f="${a.f}">${a.f}</span></td><td>${esc(a.name)}${a.extra ? `<br><small class="note">${a.extra}</small>` : ''}</td>` +
      `<td><code>${esc(a.type)}</code> · ${esc(a.size)}</td><td>${a.tls === 'std' ? `<span class="note">${esc(a.oid)}</span>` : `<code>${esc(a.oid)}</code>`}</td><td>${esc(a.sig)}</td><td>${tls}</td></tr>`;
  }).join('') || `<tr><td colspan="6" class="note">${S.algo.none}</td></tr>`;
  $('#algo-count').textContent = S.algo.count(rows.length, ALGOS.length);
}
$$('input[name="fam"]').forEach((r) => r.addEventListener('change', renderAlgos));
$('#tls-only').addEventListener('change', renderAlgos);
$('#algo-q').addEventListener('input', renderAlgos);
renderAlgos();

/* ───────────────────────── Selection simulator ───────────────────────── */
const CERTS = [
  { name: 'ECDSA P-256', secret: 'edge-cert', f: 'T', scheme: 'ecdsa_secp256r1_sha256', tls12: true },
  { name: 'ML-DSA-65', secret: 'edge-cert-pq', f: 'PQ', scheme: 'mldsa65', tls12: false },
  { name: 'MLDSA65-RSA3072-PSS-SHA512', secret: 'edge-cert-pqt', f: 'PQ/T', scheme: 'mldsa65_rsa3072_pss', tls12: false },
];
let schemes = [
  { s: 'mldsa65', on: true }, { s: 'ecdsa_secp256r1_sha256', on: true }, { s: 'mldsa65_rsa3072_pss', on: false },
];
const PRESETS = {
  openssl: { tls: '1.3', list: [['mldsa65', 1], ['ecdsa_secp256r1_sha256', 1], ['mldsa65_rsa3072_pss', 0]] },
  classic: { tls: '1.3', list: [['ecdsa_secp256r1_sha256', 1], ['mldsa65', 0], ['mldsa65_rsa3072_pss', 0]] },
  hybrid:  { tls: '1.3', list: [['mldsa65_rsa3072_pss', 1], ['mldsa65', 1], ['ecdsa_secp256r1_sha256', 1]] },
  tls12:   { tls: '1.2', list: [['mldsa65', 1], ['ecdsa_secp256r1_sha256', 1], ['mldsa65_rsa3072_pss', 0]] },
  none:    { tls: '1.3', list: [['mldsa65', 0], ['ecdsa_secp256r1_sha256', 0], ['mldsa65_rsa3072_pss', 0]] },
};
const schemesEl = $('#schemes');
function renderSchemes(focusIdx, focusDir) {
  schemesEl.innerHTML = schemes.map((x, i) => `
    <li><span class="pos">${i + 1}.</span>
      <label><input type="checkbox" data-i="${i}" ${x.on ? 'checked' : ''}>${x.s}</label>
      <span class="mv">
        <button class="btn" type="button" data-mv="-1" data-i="${i}" aria-label="${esc(S.sim.up(x.s))}" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="btn" type="button" data-mv="1" data-i="${i}" aria-label="${esc(S.sim.down(x.s))}" ${i === schemes.length - 1 ? 'disabled' : ''}>↓</button>
      </span></li>`).join('');
  if (focusIdx != null) {
    const b = schemesEl.querySelector(`button[data-i="${focusIdx}"][data-mv="${focusDir}"]:not([disabled])`) || schemesEl.querySelector(`button[data-i="${focusIdx}"]:not([disabled])`);
    b?.focus();
  }
}
schemesEl.addEventListener('change', (e) => { schemes[+e.target.dataset.i].on = e.target.checked; simulate(); });
schemesEl.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-mv]'); if (!b) return;
  const i = +b.dataset.i, d = +b.dataset.mv, j = i + d;
  if (j < 0 || j >= schemes.length) return;
  [schemes[i], schemes[j]] = [schemes[j], schemes[i]];
  renderSchemes(j, d);
  announce(S.sim.position(schemes[j].s, j + 1));
  simulate();
});
$$('[data-preset]').forEach((b) => b.addEventListener('click', () => {
  const p = PRESETS[b.dataset.preset];
  schemes = p.list.map(([s, on]) => ({ s, on: !!on }));
  $(`input[name="tlsv"][value="${p.tls}"]`).checked = true;
  renderSchemes(); simulate();
}));
$$('input[name="tlsv"]').forEach((r) => r.addEventListener('change', simulate));

function simulate() {
  const tls = $('input[name="tlsv"]:checked').value;
  const offered = schemes.filter((x) => x.on).map((x) => x.s);
  const compatible = (c) => tls === '1.3' || c.tls12;
  const trace = [`<li class="skip">${S.sim.sni}</li>`, `<li class="skip">${S.sim.many}</li>`];
  let served = null, fail = false;
  if (offered.length === 0) {
    served = CERTS.find(compatible);
    trace.push(`<li class="hit">${S.sim.noSchemes(served.name)}</li>`);
  } else {
    trace.push(`<li>${S.sim.walk(tls === '1.2')}</li>`);
    for (const s of offered) {
      const c = CERTS.find((x) => x.scheme === s);
      if (c && compatible(c)) { served = c; trace.push(`<li class="hit">${S.sim.fits(s, c.name)}</li>`); break; }
      trace.push(`<li class="skip">${S.sim.notValid(s, tls)}</li>`);
    }
    if (!served) {
      served = CERTS[0]; fail = true;
      trace.push(`<li class="hit">${S.sim.noneCompat}</li>`);
    }
  }
  $('#certs').innerHTML = CERTS.map((c) => `
    <div class="cert ${c === served ? (fail ? 'is-fail' : 'is-served') : ''}">
      <b>${c.name} <span class="fam" data-f="${c.f}">${c.f}</span></b>
      <small>${c.secret} · ${c.scheme}</small>
      <span class="served">${c === served && !fail ? `✓ ${S.sim.served}` : ''}</span>
    </div>`).join('');
  if (served && !fail && served.f !== 'T') trace.push(`<li class="skip">${S.sim.trust(served.f)}</li>`);
  $('#trace').innerHTML = trace.join('');
}
renderSchemes(); simulate();

/* ───────────────────────── Related certificates stepper ───────────────────────── */
let step = 0;
const stepper = $('#stepper');
function renderStep() {
  $('ol', stepper).innerHTML = S.steps.map((s, i) => `<li><button type="button" data-goto="${i}" ${i === step ? 'aria-current="step"' : ''}><span>${S.stepLabel(i + 1)}</span>${s.t}</button></li>`).join('');
  const s = S.steps[step];
  $('.step-body', stepper).innerHTML = `<h3>${s.h}</h3><p>${s.b}</p><ul>${s.l.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  $('[data-step="-1"]', stepper).disabled = step === 0;
  $('[data-step="1"]', stepper).disabled = step === S.steps.length - 1;
}
stepper.addEventListener('click', (e) => {
  const g = e.target.closest('[data-goto]'), n = e.target.closest('[data-step]');
  if (g) step = +g.dataset.goto; else if (n) step = Math.max(0, Math.min(S.steps.length - 1, step + +n.dataset.step)); else return;
  renderStep();
});
renderStep();

/* ───────────────────────── Interop matrix ───────────────────────── */
const ROWS = ['T', 'PQ', 'PQ/T'], COLS = ['T', 'PQ', 'PQ/T'];
let cell = ['PQ/T', 'PQ/T'];
let tickTimers = [];
const matrix = $('#matrix');
function renderMatrix() {
  let h = `<div class="hd corner">${S.matrix.corner}</div>`;
  COLS.forEach((c) => { h += `<div class="hd"><span class="fam" data-f="${c}">${c}</span>${c === 'PQ/T' ? 'Composite' : authInfo(c, 0).cert}</div>`; });
  ROWS.forEach((r) => {
    h += `<div class="hd row"><span class="fam" data-f="${r}">${r}</span></div>`;
    COLS.forEach((c) => {
      const on = cell[0] === r && cell[1] === c;
      h += `<button type="button" aria-pressed="${on}" data-cell="${r}|${c}" aria-label="${esc(S.matrix.cellLabel(r, c))}">
        <span class="tick">✓</span><code>${KEX[r].neg}</code><code>${authInfo(c, 0).scheme}</code></button>`;
    });
  });
  matrix.innerHTML = h;
}
matrix.addEventListener('click', (e) => {
  const b = e.target.closest('[data-cell]'); if (!b) return;
  cell = b.dataset.cell.split('|');
  renderMatrix(); renderCase();
  matrix.querySelector(`[data-cell="${cell.join('|')}"]`).focus();
});
$$('input[name="proto"]').forEach((r) => r.addEventListener('change', renderCase));

function renderCase() {
  const https = $('input[name="proto"]:checked').value === 'https';
  const [k, a] = cell, K = KEX[k], A = authInfo(a, 0);
  const wrong = k === 'T' ? 'MLKEM1024' : 'X25519';
  const M = S.matrix;
  const checks = M.checks(K.neg, A.scheme, https, wrong);
  $('#case-detail').innerHTML = `
    <h3>${https ? 'HTTPS' : 'MQTTS'} · KEX ${k} × AUTH ${a}</h3>
    <dl class="kv">
      <dt>${M.route}</dt><dd>${https ? M.routeHttps : M.routeMqtts}</dd>
      <dt>${M.group}</dt><dd><code>${K.neg}</code></dd>
      <dt>${M.cert}</dt><dd>${esc(A.cert)}</dd>
      <dt>${M.result}</dt><dd class="ok">✓ ${M.passed}</dd>
    </dl>
    <ul class="checklist">${checks.map(([b, t]) => `<li><span><b>${b}:</b> ${t}</span></li>`).join('')}</ul>`;
  tickTimers.forEach(clearTimeout); tickTimers = [];
  const items = $$('#case-detail .checklist li');
  if (reduceMotion.matches) items.forEach((li) => li.classList.add('done'));
  else items.forEach((li, i) => tickTimers.push(setTimeout(() => li.classList.add('done'), 160 + i * 170)));

  const conf = a === 'PQ/T' ? 'OPENSSL_CONF=hybrid.cnf ' : '';
  const blocks = https ? [
    [M.blocks.handshake, `${conf}openssl s_client -connect <LAMASSU_HOST>:443 -servername <LAMASSU_HOST> \\
  -tls1_3 -groups ${K.neg} -sigalgs ${A.scheme} \\
  -CAfile ca.pem -verify_hostname <LAMASSU_HOST> -verify_return_error < /dev/null`],
    [M.blocks.curl, 'curl --cacert ca-bundle.pem https://<LAMASSU_HOST>/api/ca/health'],
  ] : [
    ['pqc-client.cnf', `openssl_conf = openssl_init

[openssl_init]
providers = provider_sect
ssl_conf = ssl_sect

[provider_sect]
default = default_sect${a === 'PQ/T' ? '\nhybrid = hybrid_sect' : ''}

[default_sect]
activate = 1${a === 'PQ/T' ? '\n\n[hybrid_sect]\nmodule = /path/to/hybrid.so\nactivate = 1' : ''}

[ssl_sect]
system_default = tls_sect

[tls_sect]
MinProtocol = TLSv1.3
Groups = ${K.neg}
SignatureAlgorithms = ${A.scheme}`],
    [M.blocks.pubsub, `export OPENSSL_CONF=$PWD/pqc-client.cnf

mosquitto_sub -h <MQTT_HOST> -p 8883 --cafile ca.pem --tls-version tlsv1.3 \\
  -t pqc-test/hello -C 1 -W 15

mosquitto_pub -h <MQTT_HOST> -p 8883 --cafile ca.pem --tls-version tlsv1.3 \\
  -t pqc-test/hello -m "hello over pqc"`],
  ];
  $('#case-cmd').innerHTML = blocks.map(([t, c], i) =>
    `<span class="label">${t}</span><div class="codebox"><button class="copy" type="button" data-copy="case-c${i}">${S.copy.copy}</button><pre id="case-c${i}">${esc(c)}</pre></div>`).join('');
}
renderMatrix(); renderCase();

/* ───────────────────────── Copy buttons ───────────────────────── */
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-copy]'); if (!b) return;
  const text = $('#' + b.dataset.copy).textContent;
  try { await navigator.clipboard.writeText(text); b.textContent = S.copy.copied; b.dataset.state = 'copied'; announce(S.copy.announce); }
  catch { b.textContent = S.copy.unavailable; }
  setTimeout(() => { b.textContent = S.copy.copy; delete b.dataset.state; }, 1600);
});

/* ───────────────────────── Standalone nav: current section ───────────────────────── */
if (!EMBED) {
  const navLinks = $$('.topnav li a');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + en.target.id)));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach((s) => io.observe(s));
}
})();
