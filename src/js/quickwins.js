/* ==========================================================================
   quickwins.js — the Quick wins tab: overview filters, the Today / Proposed
   switch, and the small interactive demos on individual quick-win pages.
   Each init looks for its own element and returns if it isn't on the page.
   ========================================================================== */
(function () {
  'use strict';

  var WINS = window.PM_WINS || [];
  var THEMES = window.PM_THEMES || {};
  var PM = window.PM || {};
  var WF = window.WF || {};
  var $ = WF.$, $all = WF.$all;
  var TODAY = new Date('2026-10-07T12:00:00');
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(iso) { var d = new Date(iso + 'T12:00:00'); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
  function outcome(c) { return c.breach.length && c.nobreach.length ? 'mixed' : c.breach.length ? 'breach' : 'nobreach'; }
  var OL = { breach: 'Breach ruled', nobreach: 'No breach', mixed: 'Breach and no breach' };
  function parties(c) { return c.ctype === 'va' ? 'Voluntary admission by ' + c.respondent : (c.ctype === 'co' ? c.complainantCo : PM.CTYPES[c.ctype]) + ' v ' + c.respondent; }
  function card(c) {
    return '<li class="case-result"><div class="top"><span class="ref">' + esc(c.ref) + ' · sample</span><span class="pill ' + outcome(c) + '">' + OL[outcome(c)] + '</span></div>' +
      '<h3><a href="../case.html?case=' + c.id + '">' + esc(c.headline) + '</a></h3><p class="parties">' + esc(parties(c)) + '</p>' +
      '<p class="meta-line">Received ' + fmt(c.received) + ' · Completed ' + fmt(c.completed) + '</p></li>';
  }

  /* --- Pack mode: current tab and theme in the navigator (R60) ---------- */
  function initMode() {
    var qw = document.body.classList.contains('mode-qw');
    var tab = $(qw ? '.mode-tab.mode-qw' : '.mode-tab.mode-big');
    if (tab) tab.setAttribute('aria-current', 'page');
    if (!qw) return;
    var key = document.body.getAttribute('data-theme-key') || (document.body.getAttribute('data-win') === 'index' ? 'index' : '');
    var link = $('.nav-qw a[data-qw="' + key + '"]');
    if (link) link.setAttribute('aria-current', 'page');
  }

  /* --- Overview with filters (R64) ------------------------------------- */
  function initOverview() {
    var host = $('#qw-groups');
    if (!host) return;
    var state = { theme: '', high: false };
    var chipsHost = $('#qw-theme-chips');
    var keys = [''].concat(Object.keys(THEMES));
    chipsHost.innerHTML = keys.map(function (k) { return '<button type="button" class="chip" data-theme="' + k + '" aria-pressed="' + (k === '' ? 'true' : 'false') + '">' + (k ? THEMES[k] : 'All') + '</button>'; }).join('');
    function render() {
      var shown = 0, h = '';
      Object.keys(THEMES).forEach(function (k) {
        var rows = WINS.map(function (w, i) { return { w: w, n: i + 1 }; }).filter(function (r) { return r.w.theme === k && (!state.theme || state.theme === k) && (!state.high || r.w.impact === 'High'); });
        if (!rows.length) return;
        shown += rows.length;
        h += '<section class="qw-group" id="t-' + k + '" aria-labelledby="h-' + k + '"><h2 id="h-' + k + '">' + THEMES[k] + ' <span class="count">' + rows.length + '</span></h2><ol class="qw-cards">' +
          rows.map(function (r) {
            return '<li class="qw-card"><a href="' + r.w.id + '.html"><span class="qw-num">' + r.n + '</span><span class="qw-body"><b>' + esc(r.w.title) + '</b><span>' + esc(r.w.line) + '</span><span class="qw-meta"><span class="win-tag">' + r.w.impact + ' impact</span>' + (r.w.proto ? '<span class="win-tag">Also in prototype ' + r.w.proto + '</span>' : '') + '</span></span><span class="qw-go">See it</span></a></li>';
          }).join('') + '</ol></section>';
      });
      host.innerHTML = h || '<p class="empty-state">No quick wins match. Choose another theme.</p>';
      $('#qw-count').textContent = 'Showing ' + shown + ' of ' + WINS.length;
    }
    chipsHost.addEventListener('click', function (e) {
      var b = e.target.closest('[data-theme]'); if (!b) return;
      state.theme = b.getAttribute('data-theme');
      $all('[data-theme]', chipsHost).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      render();
    });
    $('#qw-high').addEventListener('change', function () { state.high = this.checked; render(); });
    render();
    var hm = window.location.hash.match(/^#t-(\w+)$/);
    if (hm && THEMES[hm[1]]) { var el = document.getElementById('t-' + hm[1]); if (el) el.scrollIntoView(); }
  }

  /* --- Today / Proposed / Side by side (R62) --------------------------- */
  function initBeforeAfter() {
    $all('[data-ba]').forEach(function (ba) {
      var panels = $('[data-ba-panels]', ba);
      var saved = null;
      try { saved = window.sessionStorage.getItem('pm-ba'); } catch (e) { /* private mode */ }
      function show(v) {
        panels.setAttribute('data-ba-panels', v);
        $all('[data-ba-show]', ba).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-ba-show') === v ? 'true' : 'false'); });
      }
      $all('[data-ba-show]', ba).forEach(function (b) {
        b.addEventListener('click', function () {
          var v = b.getAttribute('data-ba-show');
          show(v);
          try { window.sessionStorage.setItem('pm-ba', v === 'both' ? 'both' : ''); } catch (e) { /* ignore */ }
        });
      });
      show(saved === 'both' ? 'both' : 'proposed');
    });
  }

  /* --- Demos ------------------------------------------------------------ */
  function initSortDemo() {
    var sel = $('[data-qw-sort]'); if (!sel) return;
    function render() {
      var v = sel.value;
      var list = PM.CASES.slice().sort(function (a, b) {
        if (v === 'completed-asc') return a.completed < b.completed ? -1 : 1;
        if (v === 'received-desc') return a.received < b.received ? 1 : -1;
        return a.completed < b.completed ? 1 : -1;
      }).slice(0, 4);
      $('#qw-sort-list').innerHTML = list.map(card).join('');
    }
    sel.addEventListener('change', render); render();
  }

  function initDatesDemo() {
    var box = $('[data-qw-dates]'); if (!box) return;
    function since(m) { var d = new Date(TODAY); d.setMonth(d.getMonth() - m); return d; }
    function match(v) {
      return PM.CASES.filter(function (c) {
        var d = new Date(c.completed + 'T12:00:00');
        if (v === 'custom') return d >= new Date($('#qw-from').value + 'T00:00:00') && d <= new Date($('#qw-to').value + 'T23:59:59');
        return !v || d >= since(parseInt(v, 10));
      });
    }
    $all('.count[data-n]', box).forEach(function (s) { s.textContent = match(s.getAttribute('data-n')).length; });
    function render() {
      var v = (box.querySelector('[name="qw-date"]:checked') || {}).value || '';
      $('#qw-date-range').hidden = v !== 'custom';
      var res = match(v).sort(function (a, b) { return a.completed < b.completed ? 1 : -1; });
      $('#qw-date-count').textContent = res.length + ' of ' + PM.CASES.length + ' sample cases';
      $('#qw-date-list').innerHTML = res.slice(0, 4).map(card).join('') + (res.length > 4 ? '<li class="wf-meta">and ' + (res.length - 4) + ' more</li>' : '');
    }
    box.addEventListener('change', render); render();
  }

  var REFS = [
    { ref: 'AUTH/2949/3/17', t: 'Hospital doctor v A Menarini' },
    { ref: 'AUTH/3011/1/18', t: 'GlaxoSmithKline v AstraZeneca' },
    { ref: 'CASE/0685/08/25', t: 'Complainant v Eli Lilly' },
    { ref: 'CASE/0688/08/25', t: 'Sanofi (advertised sanction)' },
    { ref: 'CASE/0874/02/26', t: 'GSK (advertised sanction)' }
  ];
  function initRefsDemo() {
    var f = $('[data-qw-refs]'); if (!f) return;
    function norm(s) { return s.toLowerCase().replace(/\b(case|auth)\b/g, ' ').replace(/[^0-9/ ]/g, ' ').trim(); }
    function run() {
      var q = norm($('#qw-ref').value);
      var parts = q.split(/[\s/]+/).filter(Boolean);
      var hits = REFS.filter(function (r) {
        var segs = r.ref.split('/').slice(1);
        if (!parts.length) return false;
        if (parts.length === 1) return segs[0].replace(/^0+/, '') === parts[0].replace(/^0+/, '') || segs[0].indexOf(parts[0]) > -1;
        return parts.every(function (p, i) { return segs[i] && segs[i].replace(/^0+/, '') === p.replace(/^0+/, ''); });
      });
      $('#qw-ref-out').innerHTML = hits.length ? hits.map(function (r) { return '<li><span class="ref">' + r.ref + '</span><a href="#">' + esc(r.t) + '</a></li>'; }).join('') : '<li class="muted">No case with that reference in this demo.</li>';
    }
    f.addEventListener('submit', function (e) { e.preventDefault(); run(); });
    $('#qw-ref').addEventListener('input', run);
    run();
  }

  function initCiteDemo() {
    $all('[data-qw-copy]').forEach(function (b) {
      b.addEventListener('click', function () {
        var link = b.getAttribute('data-qw-copy') === 'link';
        var text = link ? 'https://www.pmcpa.org.uk/cases/completed-cases/auth2949317-hospital-doctor-v-a-menarini/' : $('#qw-cite').textContent;
        WF.copyText(text, function () { WF.toast(link ? 'Link copied' : 'Citation copied'); });
      });
    });
    var p = $('[data-qw-print]'); if (p) p.addEventListener('click', function () { window.print(); });
  }

  /* Clause list as live today, sorted and grouped (16) */
  var LIVE_CLAUSES = ['12', '27', '29', '30', '10.1', '12.1', '15.1', '24.1', '26.1', '28.1', '31.1', '8.1', '12.2', '15.2', '18.2', '19.2', '24.2', '26.2', '28.2', '29.2', '6.2', '8.2', '9.2', '14.3', '17.3', '26.3', '8.3', '10.4', '3.4', '5.4', '8.4', '9.4', '10.5', '12.5', '15.5', '24.5', '26.5', '27.5', '28.5', '10.6', '24.6', '3.6', '5.6', '10.7', '12.7', '1.9', '10.10', '10.11', '10.12', '1.13', '1.16', '1.17', '1.19', '1.22', '1.24'];
  function cmp(a, b) { var x = a.split('.').map(Number), y = b.split('.').map(Number); return x[0] - y[0] || (x[1] || 0) - (y[1] || 0); }
  function initClauseDemo() {
    var sel = $('[data-qw-clauses]'); if (!sel) return;
    var sorted = LIVE_CLAUSES.slice().sort(cmp);
    var h = '<option value="">Choose a clause</option>';
    PM.SECTIONS.slice(1).forEach(function (s) {
      var inSec = sorted.filter(function (c) { var cl = PM.CLAUSES[parseInt(c, 10) - 1]; return cl && cl.section === s.id; });
      if (!inSec.length) return;
      h += '<optgroup label="Section ' + s.id + ' · ' + s.range + '">' + inSec.map(function (c) { var cl = PM.CLAUSES[parseInt(c, 10) - 1]; return '<option value="' + c + '">' + c + (c.indexOf('.') === -1 ? ' ' + cl.title : '') + '</option>'; }).join('') + '</optgroup>';
    });
    sel.innerHTML = h;
    function out(v) {
      var cl = PM.CLAUSES[parseInt(v, 10) - 1];
      var qas = PM.QAS.filter(function (q) { return q.clause === v || q.clause.indexOf(v + '.') === 0; });
      $('#qw-clause-out').textContent = 'Clause ' + v + (cl ? ' (' + cl.title + ')' : '') + ': ' + (qas.length ? qas.length + ' Q&A' + (qas.length === 1 ? '' : 's') + ' in this demo' : 'Q&As would be listed here');
    }
    sel.addEventListener('change', function () { if (sel.value) { $('#qw-clause-n').value = sel.value; out(sel.value); } });
    var f = $('[data-qw-goto]');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#qw-clause-n').value.trim().replace(/^clause\s*/i, '');
      var ok = LIVE_CLAUSES.indexOf(v) > -1;
      var field = $('#qw-clause-n').closest('.field');
      field.classList.toggle('has-error', !ok); $('.field-error', field).hidden = ok;
      if (!ok) { $('#qw-clause-n').focus(); return; }
      sel.value = v; out(v);
    });
  }

  function initQaDemo() {
    var input = $('[data-qw-qa]'); if (!input) return;
    function render() {
      var t = input.value.trim().toLowerCase();
      var res = PM.QAS.filter(function (q) { return !t || (q.q + ' ' + q.topic).toLowerCase().indexOf(t) > -1; });
      $('#qw-qa-count').textContent = res.length + ' of ' + PM.QAS.length + ' Q&As';
      $('#qw-qa-list').innerHTML = res.map(function (q, i) {
        var title = esc(q.q);
        if (t) title = title.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
        return '<li class="hit"><span class="type">' + esc(q.topic) + ' · Clause ' + q.clause + '</span><h3><a href="#">' + title + '</a></h3><p>Revised ' + q.revised + (i === 0 && !t ? ' <span class="tag-s">Updated</span>' : '') + '</p></li>';
      }).join('');
    }
    input.addEventListener('input', render); render();
  }

  function initGuidanceDemo() {
    var host = $('#qw-guid-list'); if (!host) return;
    $('#qw-guid-today').innerHTML = PM.GUIDANCE.map(function (g) { return '<li>' + esc(g.t) + '</li>'; }).join('');
    host.innerHTML = PM.GUIDANCE.map(function (g) {
      return '<li class="hit"><span class="type">Guidance · 2024 Code · Published [date] · [Format]</span><h3><a href="#">' + esc(g.t) + '</a></h3><p><span class="chips-row">' + g.clauses.map(function (c) { var cl = PM.CLAUSES[parseInt(c, 10) - 1]; return '<span class="clause-chip b" data-sec="' + (cl ? cl.section : '') + '">' + c + '</span>'; }).join('') + '</span></p></li>';
    }).join('');
  }

  function initPipelineDemo() {
    var sel = $('[data-qw-snap]'); if (!sel) return;
    var snaps = PM.PERFORMANCE.snapshots, keys = Object.keys(snaps).sort().reverse();
    sel.innerHTML = keys.map(function (k) { return '<option value="' + k + '">' + snaps[k].label + '</option>'; }).join('');
    function table(k) {
      var s = snaps[k], i = keys.indexOf(k), prev = snaps[keys[i + 1]];
      function val(x, key) { return typeof key === 'function' ? key(x) : x[key]; }
      function row(label, key, cls) {
        var v = val(s, key), pv = prev ? val(prev, key) : null;
        var ch = pv == null ? '—' : (v === pv ? 'no change' : (v > pv ? '+' : '−') + Math.abs(v - pv));
        return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><th scope="row">' + label + '</th><td class="n">' + v + '</td><td class="n">' + ch + '</td></tr>';
      }
      var waiting = function (x) { return x.prep + x.panel + x.assigned; };
      var all = function (x) { return waiting(x) + x.undertaking + x.appeal + x.sanction; };
      $('#qw-pipeline').innerHTML = '<thead><tr><th scope="col">Stage</th><th scope="col" class="n">Cases</th><th scope="col" class="n">Change since ' + (prev ? prev.label : 'previous') + '</th></tr></thead><tbody>' +
        row('Case preparation', 'prep') + row('Referred to the Panel, not yet assigned', 'panel') + row('Assigned to Panel members', 'assigned') +
        row('Awaiting a decision or Panel ruling', waiting, 'sub') + row('Awaiting the undertaking or an appeal', 'undertaking') + row('Processing appeal', 'appeal') + row('Sanction in progress', 'sanction') +
        row('All open cases', all, 'total') + '</tbody>';
    }
    table(keys[0]);
    sel.addEventListener('change', function () { table(sel.value); });
  }

  function initWaitDemo() {
    var f = $('[data-qw-wait]'); if (!f) return;
    f.addEventListener('submit', function (e) { e.preventDefault(); if (!WF.validateForm(f)) return; f.hidden = true; $('#qw-wait-done').hidden = false; });
  }

  function init404Demo() {
    var f = $('[data-qw-404]'); if (!f) return;
    f.addEventListener('submit', function (e) { e.preventDefault(); WF.toast('Search would open with results for “' + ($('#qw-404-q').value || '…') + '”'); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMode();
    initOverview();
    initBeforeAfter();
    initSortDemo();
    initDatesDemo();
    initRefsDemo();
    initCiteDemo();
    initClauseDemo();
    initQaDemo();
    initGuidanceDemo();
    initPipelineDemo();
    initWaitDemo();
    init404Demo();
  });
})();
