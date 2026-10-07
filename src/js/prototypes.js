/* ==========================================================================
   prototypes.js — behaviour for the five PMCPA prototypes.
   Pages are declarative; each init function looks for its own root element
   and returns if it isn't on the page. Data comes from data.js (window.PM).
   ========================================================================== */
(function () {
  'use strict';

  var PM = window.PM || {};
  var WF = window.WF || {};
  var $ = WF.$, $all = WF.$all;
  var TODAY = new Date('2026-10-07T12:00:00');
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  /* --- Shared helpers ---------------------------------------------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmtDate(iso) { var d = new Date(iso + 'T12:00:00'); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
  function caseById(id) { for (var i = 0; i < PM.CASES.length; i++) { if (PM.CASES[i].id === id) return PM.CASES[i]; } return null; }
  function outcome(c) { return c.breach.length && c.nobreach.length ? 'mixed' : c.breach.length ? 'breach' : 'nobreach'; }
  var OUTCOME_LABEL = { breach: 'Breach ruled', nobreach: 'No breach', mixed: 'Breach and no breach' };
  function pill(c) { var o = outcome(c); return '<span class="pill ' + o + '">' + OUTCOME_LABEL[o] + '</span>'; }
  function parties(c) {
    if (c.ctype === 'va') return 'Voluntary admission by ' + c.respondent;
    var who = c.ctype === 'co' ? c.complainantCo : PM.CTYPES[c.ctype];
    return who + ' v ' + c.respondent;
  }
  function clauseObj(n) { var k = parseInt(n, 10); return PM.CLAUSES[k - 1] || null; }
  function clauseHref(sub, prefix) {
    var top = String(sub).split('.')[0];
    return (prefix || '') + 'clause.html?clause=' + top + (String(sub).indexOf('.') > -1 ? '#c' + String(sub).replace('.', '-') : '');
  }
  function chip(sub, kind, c) {
    var label = (kind === 'b' ? '' : '') + sub;
    var title = kind === 'b' ? 'Breach of clause ' + sub : 'No breach of clause ' + sub;
    if (c.code === 2024) return '<a class="clause-chip ' + kind + '" href="' + clauseHref(sub) + '" title="' + title + '"><span class="visually-hidden">' + (kind === 'b' ? 'Breach: ' : 'No breach: ') + '</span>' + esc(label) + '</a>';
    return '<span class="clause-chip ' + kind + '" title="' + title + ' (' + c.code + ' Code)"><span class="visually-hidden">' + (kind === 'b' ? 'Breach: ' : 'No breach: ') + '</span>' + esc(label) + '</span>';
  }
  function chipsFor(c) {
    var h = '';
    if (c.breach.length) h += '<span class="chip-key">Breach</span>' + c.breach.map(function (s) { return chip(s, 'b', c); }).join('');
    if (c.nobreach.length) h += '<span class="chip-key">No breach</span>' + c.nobreach.map(function (s) { return chip(s, 'nb', c); }).join('');
    return '<div class="chips-row">' + h + '</div>';
  }
  function matchesClause(c, sel) {
    var all = c.breach.concat(c.nobreach);
    return all.some(function (s) { return s === sel || s.indexOf(sel + '.') === 0; });
  }
  function companies() {
    var set = {};
    PM.CASES.forEach(function (c) { set[c.respondent] = 1; });
    return Object.keys(set).sort();
  }
  function setQuery(obj) {
    var p = new URLSearchParams();
    Object.keys(obj).forEach(function (k) {
      var v = obj[k];
      if (Array.isArray(v)) { if (v.length) p.set(k, v.join(',')); }
      else if (v) p.set(k, v);
    });
    var qs = p.toString();
    try { window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash); } catch (e) { /* file:// in some browsers */ }
    try { window.sessionStorage.setItem('pm-last-search', qs); } catch (e) { /* private mode */ }
    return qs;
  }
  function trapEscape(fn) { document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fn(); }); }
  function wireSimpleForm(formId, doneId, onDone) {
    var f = document.getElementById(formId);
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!WF.validateForm(f)) return;
      f.hidden = true;
      var d = document.getElementById(doneId);
      d.hidden = false;
      if (onDone) onDone(f, d);
      var h = d.querySelector('[tabindex="-1"]'); if (h) h.focus();
    });
  }
  function caseCard(c, small) {
    return '<li><span class="ref">' + esc(c.ref) + '</span><a href="case.html?case=' + c.id + '">' + esc(c.headline) + '</a>' +
      '<span class="wf-meta">' + esc(parties(c)) + '</span><div class="row">' + pill(c) + '<span class="wf-meta">' + (small ? '' : 'Completed ') + fmtDate(c.completed) + '</span></div></li>';
  }

  /* ======================================================================
     Prototype 1: Case finder (R10–R19)
     ====================================================================== */
  function initFinder() {
    var list = $('#case-list');
    if (!list) return;
    var p = WF.params();
    var split = function (k) { var v = p.get(k); return v ? v.split(',') : []; };
    var S = {
      q: p.get('q') || '', outcome: split('outcome'), clause: split('clause'), company: split('company'), ctype: split('ctype'),
      code: split('code'), sanction: split('sanction'), appeal: p.get('appeal') || '', date: p.get('date') || '', from: p.get('from') || '', to: p.get('to') || '',
      sort: p.get('sort') || 'completed-desc', page: parseInt(p.get('page') || '1', 10)
    };
    var PER = 10;
    var SANCTIONS = ['Public reprimand', 'Advertisement', 'Corrective statement', 'Audit'];
    var DATES = { '': 'Any time', '6m': 'Last 6 months', '12m': 'Last 12 months', '24m': 'Last 2 years', custom: 'Choose dates' };

    $('#finder-q').value = S.q;
    $('#finder-sort').value = S.sort;

    function tokens(q) {
      var out = [], re = /"([^"]+)"|(\S+)/g, m;
      while ((m = re.exec(q.toLowerCase())) !== null) out.push(m[1] || m[2]);
      return out.filter(function (t) { return ['case', 'auth'].indexOf(t) === -1; });
    }
    function hay(c) {
      return [c.ref, c.ref.replace(/\//g, ' '), c.ref.replace(/\D/g, ' '), parties(c), c.headline, c.summary, c.breach.join(' '), c.nobreach.join(' ')].join(' ').toLowerCase();
    }
    function score(c, toks) {
      var h = hay(c), s = 0;
      toks.forEach(function (t) { if (c.headline.toLowerCase().indexOf(t) > -1) s += 3; if (c.ref.toLowerCase().indexOf(t) > -1) s += 5; if (h.indexOf(t) > -1) s += 1; });
      return s;
    }
    function inDate(c) {
      if (!S.date) return true;
      var d = new Date(c.completed + 'T12:00:00');
      if (S.date === 'custom') {
        if (S.from && d < new Date(S.from + 'T00:00:00')) return false;
        if (S.to && d > new Date(S.to + 'T23:59:59')) return false;
        return true;
      }
      var months = { '6m': 6, '12m': 12, '24m': 24 }[S.date];
      var start = new Date(TODAY); start.setMonth(start.getMonth() - months);
      return d >= start;
    }
    /* except: the facet being counted, so its own options show what each would add */
    function filtered(except) {
      var toks = tokens(S.q);
      return PM.CASES.filter(function (c) {
        if (toks.length) { var h = hay(c); if (!toks.every(function (t) { return h.indexOf(t) > -1; })) return false; }
        if (except !== 'outcome' && S.outcome.length && S.outcome.indexOf(outcome(c)) === -1) return false;
        if (except !== 'clause' && S.clause.length && (c.code !== 2024 || !S.clause.some(function (cl) { return matchesClause(c, cl); }))) return false;
        if (except !== 'company' && S.company.length && S.company.indexOf(c.respondent) === -1) return false;
        if (except !== 'ctype' && S.ctype.length && S.ctype.indexOf(c.ctype) === -1) return false;
        if (except !== 'code' && S.code.length && S.code.indexOf(String(c.code)) === -1) return false;
        if (except !== 'sanction' && S.sanction.length && !S.sanction.every(function (s) { return c.sanctions.indexOf(s) > -1; })) return false;
        if (except !== 'appeal' && S.appeal === 'yes' && c.appeal.indexOf('Appeal') !== 0) return false;
        if (except !== 'date' && !inDate(c)) return false;
        return true;
      });
    }
    function count(except, test) { return filtered(except).filter(test).length; }

    function checkRow(group, value, label, n, checked) {
      return '<label class="check' + (n ? '' : ' zero') + '"><input type="checkbox" data-group="' + group + '" value="' + esc(value) + '"' + (checked ? ' checked' : '') + '> <span class="lbl">' + esc(label) + '</span><span class="count">' + n + '</span></label>';
    }

    var openSections = {};
    function renderFacets() {
      var h = '';
      // Outcome
      h += '<fieldset class="facet"><legend>Outcome</legend>';
      ['breach', 'nobreach', 'mixed'].forEach(function (o) { h += checkRow('outcome', o, OUTCOME_LABEL[o], count('outcome', function (c) { return outcome(c) === o; }), S.outcome.indexOf(o) > -1); });
      h += '</fieldset>';
      // Clause, grouped by section, numeric order (R12, R16)
      h += '<div class="facet"><h3>Clause <span class="wf-meta">(2024 Code)</span></h3>';
      PM.SECTIONS.slice(1).forEach(function (sec) {
        var cls = PM.CLAUSES.filter(function (c) { return c.section === sec.id; });
        var secCount = count('clause', function (c) { return c.code === 2024 && cls.some(function (cl) { return matchesClause(c, String(cl.n)); }); });
        var open = openSections[sec.id] || cls.some(function (cl) { return S.clause.indexOf(String(cl.n)) > -1; });
        h += '<div class="facet-sec"><button type="button" aria-expanded="' + (open ? 'true' : 'false') + '" data-sec="' + sec.id + '"><span>Section ' + sec.id + ' · ' + sec.range + '</span><span class="count">' + secCount + '</span></button><div class="clause-list"' + (open ? '' : ' hidden') + '>';
        cls.forEach(function (cl) {
          var n = count('clause', function (c) { return c.code === 2024 && matchesClause(c, String(cl.n)); });
          h += checkRow('clause', String(cl.n), cl.n + ' ' + cl.title, n, S.clause.indexOf(String(cl.n)) > -1);
        });
        h += '</div></div>';
      });
      h += '</div>';
      // Company with type-ahead (R12)
      h += '<div class="facet"><h3><label for="co-filter" style="margin:0">Company</label></h3><div class="typeahead"><input type="text" id="co-filter" autocomplete="off" placeholder="Start typing a company" role="combobox" aria-expanded="false" aria-controls="co-options"><ul id="co-options" role="listbox" hidden></ul></div><div class="picked">' +
        S.company.map(function (c) { return '<button type="button" class="chip" data-remove="company" data-value="' + esc(c) + '" aria-label="Remove ' + esc(c) + '">' + esc(c) + ' ×</button>'; }).join('') + '</div></div>';
      // Complainant
      h += '<fieldset class="facet"><legend>Complainant</legend>';
      Object.keys(PM.CTYPES).forEach(function (k) { h += checkRow('ctype', k, PM.CTYPES[k], count('ctype', function (c) { return c.ctype === k; }), S.ctype.indexOf(k) > -1); });
      h += '</fieldset>';
      // Completed date (R13)
      h += '<fieldset class="facet"><legend>Completed</legend>';
      Object.keys(DATES).forEach(function (k) { h += '<label class="check"><input type="radio" name="date" value="' + k + '"' + (S.date === k ? ' checked' : '') + '> ' + DATES[k] + '</label>'; });
      h += '<div class="date-range"' + (S.date === 'custom' ? '' : ' hidden') + '><div><label for="d-from">From</label><input type="date" id="d-from" value="' + esc(S.from) + '"></div><div><label for="d-to">To</label><input type="date" id="d-to" value="' + esc(S.to) + '"></div></div></fieldset>';
      // Code year
      h += '<fieldset class="facet"><legend>Code year</legend>';
      ['2024', '2021', '2019', '2016'].forEach(function (y) { h += checkRow('code', y, y + ' Code', count('code', function (c) { return String(c.code) === y; }), S.code.indexOf(y) > -1); });
      h += '</fieldset>';
      // Sanctions and appeal
      h += '<fieldset class="facet"><legend>Additional sanctions</legend>';
      SANCTIONS.forEach(function (s) { h += checkRow('sanction', s, s, count('sanction', function (c) { return c.sanctions.indexOf(s) > -1; }), S.sanction.indexOf(s) > -1); });
      h += '</fieldset><fieldset class="facet"><legend>Appeal</legend>' + checkRow('appeal', 'yes', 'Went to appeal', count('appeal', function (c) { return c.appeal.indexOf('Appeal') === 0; }), S.appeal === 'yes') + '</fieldset>';
      $('#facet-body').innerHTML = h;
    }

    function activeChips() {
      var out = [];
      if (S.q) out.push(['q', S.q, '“' + S.q + '”']);
      S.outcome.forEach(function (v) { out.push(['outcome', v, OUTCOME_LABEL[v]]); });
      S.clause.forEach(function (v) { out.push(['clause', v, 'Clause ' + v]); });
      S.company.forEach(function (v) { out.push(['company', v, v]); });
      S.ctype.forEach(function (v) { out.push(['ctype', v, PM.CTYPES[v]]); });
      S.code.forEach(function (v) { out.push(['code', v, v + ' Code']); });
      S.sanction.forEach(function (v) { out.push(['sanction', v, v]); });
      if (S.appeal) out.push(['appeal', 'yes', 'Went to appeal']);
      if (S.date) out.push(['date', S.date, S.date === 'custom' ? 'Completed ' + (S.from ? 'from ' + fmtDate(S.from) : '') + (S.to ? ' to ' + fmtDate(S.to) : '') : 'Completed: ' + DATES[S.date]]);
      return out;
    }

    function render(keepFocus) {
      var res = filtered();
      var toks = tokens(S.q);
      var relOpt = $('#finder-sort option[value="relevance"]');
      relOpt.hidden = !toks.length; relOpt.disabled = !toks.length;
      if (!toks.length && S.sort === 'relevance') { S.sort = 'completed-desc'; $('#finder-sort').value = S.sort; }
      res.sort(function (a, b) {
        if (S.sort === 'completed-asc') return a.completed < b.completed ? -1 : 1;
        if (S.sort === 'received-desc') return a.received < b.received ? 1 : -1;
        if (S.sort === 'relevance') return score(b, toks) - score(a, toks) || (a.completed < b.completed ? 1 : -1);
        return a.completed < b.completed ? 1 : -1;
      });
      var pages = Math.max(1, Math.ceil(res.length / PER));
      if (S.page > pages) S.page = pages;
      var slice = res.slice((S.page - 1) * PER, S.page * PER);
      var total = PM.CASES.length;
      $('#results-count').textContent = res.length === total && !activeChips().length ? total + ' completed cases (sample)' : res.length + ' of ' + total + ' cases match';
      list.innerHTML = slice.length ? slice.map(function (c) {
        var meta = [c.code + ' Code', 'Completed ' + fmtDate(c.completed)];
        if (c.appeal !== 'No appeal') meta.push(c.appeal);
        var extra = c.sanctions.filter(function (s) { return s !== 'Undertaking'; });
        if (extra.length) meta.push(extra.join(', '));
        return '<li class="case-result"><div class="top"><span class="ref">' + esc(c.ref) + '</span>' + pill(c) + '</div>' +
          '<h3><a href="case.html?case=' + c.id + '">' + esc(c.headline) + '</a></h3><p class="parties">' + esc(parties(c)) + '</p>' +
          '<p class="sum">' + esc(c.summary) + '</p>' + chipsFor(c) + '<p class="meta-line">' + meta.map(esc).join('<span aria-hidden="true">·</span>') + '</p></li>';
      }).join('') : '<li class="empty-state"><h3>No cases match</h3><p>Try removing a filter, or search for a broader term.</p><button type="button" class="btn btn-secondary" data-clear-all>Clear all filters</button></li>';
      // Pagination
      var ph = '';
      if (pages > 1) {
        for (var i = 1; i <= pages; i++) ph += '<li>' + (i === S.page ? '<span class="current" aria-current="page">' + i + '</span>' : '<a href="#" data-page="' + i + '">' + i + '</a>') + '</li>';
        if (S.page < pages) ph += '<li><a href="#" data-page="' + (S.page + 1) + '">Next</a></li>';
      }
      $('#pagination').innerHTML = ph;
      // Active filter chips (R17)
      var ac = activeChips();
      $('#active-filters').innerHTML = ac.map(function (a) { return '<button type="button" class="chip" data-remove="' + a[0] + '" data-value="' + esc(a[1]) + '">' + esc(a[2]) + ' <span aria-hidden="true">×</span><span class="visually-hidden">remove</span></button>'; }).join('') + (ac.length ? '<button type="button" class="btn-link" data-clear-all>Clear all</button>' : '');
      $('#facet-count').textContent = ac.length ? '(' + ac.length + ')' : '';
      $('#facets-done').textContent = 'Show ' + res.length + ' case' + (res.length === 1 ? '' : 's');
      renderFacets();
      if (keepFocus) { var el = document.querySelector(keepFocus); if (el) el.focus(); }
      setQuery({ q: S.q, outcome: S.outcome, clause: S.clause, company: S.company, ctype: S.ctype, code: S.code, sanction: S.sanction, appeal: S.appeal, date: S.date, from: S.date === 'custom' ? S.from : '', to: S.date === 'custom' ? S.to : '', sort: S.sort === 'completed-desc' ? '' : S.sort, page: S.page > 1 ? String(S.page) : '' });
    }

    function toggle(arr, v) { var i = arr.indexOf(v); if (i > -1) arr.splice(i, 1); else arr.push(v); }

    $('#finder-form').addEventListener('submit', function (e) {
      e.preventDefault();
      S.q = $('#finder-q').value.trim(); S.page = 1;
      if (S.q && S.sort === 'completed-desc') S.sort = 'completed-desc';
      render();
    });
    $('#finder-sort').addEventListener('change', function () { S.sort = this.value; S.page = 1; render('#finder-sort'); });

    document.addEventListener('change', function (e) {
      var t = e.target;
      if (t.matches('input[type="checkbox"][data-group]')) {
        var g = t.getAttribute('data-group');
        if (g === 'appeal') S.appeal = t.checked ? 'yes' : '';
        else toggle(S[g], t.value);
        S.page = 1;
        render('input[data-group="' + g + '"][value="' + t.value + '"]');
      } else if (t.name === 'date' && t.closest('#facets')) {
        S.date = t.value; S.page = 1;
        render('input[name="date"][value="' + t.value + '"]');
      } else if (t.id === 'd-from' || t.id === 'd-to') {
        S[t.id === 'd-from' ? 'from' : 'to'] = t.value; render('#' + t.id);
      }
    });
    document.addEventListener('click', function (e) {
      var t = e.target.closest('button, a');
      if (!t) return;
      if (t.hasAttribute('data-sec')) {
        var id = t.getAttribute('data-sec');
        var open = t.getAttribute('aria-expanded') !== 'true';
        openSections[id] = open;
        t.setAttribute('aria-expanded', open ? 'true' : 'false');
        t.nextElementSibling.hidden = !open;
      } else if (t.hasAttribute('data-remove')) {
        var g = t.getAttribute('data-remove'), v = t.getAttribute('data-value');
        if (g === 'q') { S.q = ''; $('#finder-q').value = ''; }
        else if (g === 'appeal') S.appeal = '';
        else if (g === 'date') { S.date = ''; S.from = ''; S.to = ''; }
        else toggle(S[g], v);
        S.page = 1; render();
      } else if (t.hasAttribute('data-clear-all')) {
        S = { q: '', outcome: [], clause: [], company: [], ctype: [], code: [], sanction: [], appeal: '', date: '', from: '', to: '', sort: 'completed-desc', page: 1 };
        $('#finder-q').value = ''; $('#finder-sort').value = S.sort; render();
      } else if (t.hasAttribute('data-page')) {
        e.preventDefault(); S.page = parseInt(t.getAttribute('data-page'), 10); render();
        $('#results-count').scrollIntoView({ block: 'start' });
      } else if (t.hasAttribute('data-co')) {
        var co = t.getAttribute('data-co');
        if (S.company.indexOf(co) === -1) S.company.push(co);
        S.page = 1; render('#co-filter');
      }
    });
    // Company type-ahead (R12)
    document.addEventListener('input', function (e) {
      if (e.target.id !== 'co-filter') return;
      var v = e.target.value.trim().toLowerCase();
      var ul = $('#co-options');
      var opts = companies().filter(function (c) { return S.company.indexOf(c) === -1 && (!v || c.toLowerCase().indexOf(v) > -1); });
      ul.innerHTML = opts.map(function (c) { var n = count('company', function (x) { return x.respondent === c; }); return '<li role="option"><button type="button" data-co="' + esc(c) + '">' + esc(c) + ' <span class="count">(' + n + ')</span></button></li>'; }).join('') || '<li class="muted" style="padding:0.45rem 0.75rem">No matching company</li>';
      ul.hidden = false; e.target.setAttribute('aria-expanded', 'true');
    });
    document.addEventListener('focusin', function (e) {
      if (e.target.id === 'co-filter') e.target.dispatchEvent(new Event('input', { bubbles: true }));
      else if (!e.target.closest('.typeahead')) { var ul = $('#co-options'); if (ul) ul.hidden = true; }
    });
    document.addEventListener('keydown', function (e) {
      if (e.target.id === 'co-filter' && e.key === 'ArrowDown') { var b = $('#co-options button'); if (b) { e.preventDefault(); b.focus(); } }
      if (e.target.closest && e.target.closest('#co-options') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        var li = e.target.closest('li'); var nx = e.key === 'ArrowDown' ? li.nextElementSibling : li.previousElementSibling;
        if (nx && nx.querySelector('button')) nx.querySelector('button').focus(); else if (!nx) $('#co-filter').focus();
      }
      if (e.key === 'Escape') { var ul = $('#co-options'); if (ul) ul.hidden = true; }
    });

    // Filters sheet on phones (R16)
    var openBtn = $('#facets-open');
    function closeSheet() { if (!document.body.classList.contains('facets-open')) return; document.body.classList.remove('facets-open'); openBtn.setAttribute('aria-expanded', 'false'); openBtn.focus(); }
    openBtn.addEventListener('click', function () { document.body.classList.add('facets-open'); openBtn.setAttribute('aria-expanded', 'true'); $('#facets-close').focus(); });
    $('#facets-close').addEventListener('click', closeSheet);
    $('#facets-done').addEventListener('click', closeSheet);
    trapEscape(closeSheet);

    // Email alert for this search (R18)
    $('#alert-open').addEventListener('click', function () {
      var ac = activeChips();
      $('#alert-summary').textContent = ac.length ? 'New completed cases matching: ' + ac.map(function (a) { return a[2]; }).join(', ') + '.' : 'All new completed cases. Tip: filter first to narrow your alert, for example to a clause or company.';
      $('#alert-form').hidden = false; $('#alert-done').hidden = true;
      WF.openModal('alert-modal');
    });
    wireSimpleForm('alert-form', 'alert-done', function () { $('#alert-done-email').textContent = $('#alert-email').value; });

    render();
  }

  /* ======================================================================
     Prototype 2: Case report (R20–R27)
     ====================================================================== */
  function initCase() {
    var root = $('#c-report');
    if (!root) return;
    var c = caseById(WF.param('case') || '') || caseById('9068');
    var o = outcome(c);
    document.title = c.ref + ' ' + parties(c) + ' — PMCPA prototype';
    try { var last = window.sessionStorage.getItem('pm-last-search'); if (last) $('#back-to-results').setAttribute('href', 'cases.html?' + last); } catch (e) { /* ignore */ }
    $('#c-ref').textContent = c.ref + (c.code === 2024 ? '' : ' · ' + c.code + ' Code');
    $('#c-title').textContent = parties(c);
    $('#c-headline').textContent = c.headline;
    $('#c-outcome').innerHTML = pill(c) + '<span class="sample-flag">Sample case</span>';
    $('#c-summary').textContent = c.summary;
    var extra = c.sanctions.filter(function (s) { return s !== 'Undertaking'; });
    $('#c-facts').innerHTML = [
      ['Received', fmtDate(c.received)], ['Completed', fmtDate(c.completed)], ['Applicable Code', c.code],
      ['Complainant', c.ctype === 'co' ? c.complainantCo : PM.CTYPES[c.ctype]], ['Appeal', c.appeal],
      ['Sanctions', c.sanctions.length ? c.sanctions.join(', ') : 'None']
    ].map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');

    // Rulings by clause (R21)
    var appealed = c.appeal.indexOf('Appeal') === 0;
    var rows = c.breach.map(function (s) { return [s, 'Breach']; }).concat(c.nobreach.map(function (s) { return [s, 'No breach']; }));
    rows.sort(function (a, b) { return parseFloat(a[0]) - parseFloat(b[0]); });
    var t = '<thead><tr><th scope="col">Clause</th><th scope="col">About</th><th scope="col">Panel ruling</th>' + (appealed ? '<th scope="col">Appeal Board</th>' : '') + '</tr></thead><tbody>';
    rows.forEach(function (r, i) {
      var cl = clauseObj(r[0]);
      var link = c.code === 2024 ? '<a href="' + clauseHref(r[0]) + '">Clause ' + r[0] + '</a>' : '<a href="#">Clause ' + r[0] + ' (' + c.code + ' Code)</a>';
      var about = c.code === 2024 && cl ? cl.title : '[Clause title in the ' + c.code + ' Code]';
      var appealCell = '';
      if (appealed) appealCell = '<td>' + (c.appeal.indexOf('overturned in part') > -1 && i === 0 ? 'Overturned' : r[1] === 'Breach' ? 'Upheld' : '—') + '</td>';
      t += '<tr><th scope="row">' + link + '</th><td>' + esc(about) + '</td><td><span class="pill ' + (r[1] === 'Breach' ? 'breach' : 'nobreach') + '">' + r[1] + '</span></td>' + appealCell + '</tr>';
    });
    $('#c-rulings').innerHTML = t + '</tbody>';

    // Timeline (R22)
    var steps = [['Complaint received', fmtDate(c.received)], ['Case preparation', 'Within [x] weeks'], ['Panel ruling', '[Date]']];
    if (appealed) steps.push(['Appeal Board', '[Date]']);
    steps.push(['Case completed', fmtDate(c.completed)]);
    $('#c-timeline').innerHTML = steps.map(function (s) { return '<li><b>' + s[0] + '</b>' + s[1] + '</li>'; }).join('');

    // Report (R23, R24)
    var sec = [
      ['summary', 'Case summary', '<p>' + esc(c.summary) + '</p><p class="placeholder-text">[The published case summary continues here.]</p>'],
      ['complaint', 'The complaint', '<p class="placeholder-text">[What the complainant alleged, quoting the material at issue.]</p>'],
      ['response', 'The response', '<p class="placeholder-text">[' + esc(c.respondent) + '’s response to each allegation.]</p>'],
      ['panel', 'Panel ruling', rows.map(function (r) { return '<h3 class="h-sm">Clause ' + r[0] + ': ' + r[1].toLowerCase() + '</h3><p class="placeholder-text">[The Panel’s reasoning on clause ' + r[0] + '.]</p>'; }).join('')]
    ];
    if (appealed) sec.push(['appeal', 'Appeal', '<p>' + esc(c.appeal) + '.</p><p class="placeholder-text">[Appeal by the ' + (c.appeal.indexOf('complainant') > -1 ? 'complainant' : 'respondent') + ', comments and the Appeal Board’s ruling.]</p>']);
    sec.push(['sanctions', 'Sanctions', '<ul>' + (c.sanctions.length ? c.sanctions.map(function (s) {
      var l = s === 'Undertaking' ? 'Undertaking received' : s === 'Advertisement' ? '<a href="#">Advertisement in the BMJ and the Nursing Standard</a>' : s === 'Public reprimand' ? '<a href="#">Public reprimand</a> [date]' : s === 'Audit' ? 'Audit of the company’s procedures [and re-audit]' : '<a href="#">Corrective statement</a>';
      return '<li>' + l + '</li>';
    }).join('') : '<li>No sanctions: no breach was ruled.</li>') + '</ul>' + (extra.length ? '<div class="wf-note" data-note="4"><span class="wf-note-label">Behaviour</span>Advertisements and public reprimands for this case are grouped here and link to the published notice, instead of appearing only as separate entries under Advertised sanctions.</div>' : '')]);
    root.innerHTML = sec.map(function (s) { return '<section id="r-' + s[0] + '" aria-labelledby="h-' + s[0] + '"><h2 id="h-' + s[0] + '">' + s[1] + '</h2>' + s[2] + '</section>'; }).join('');
    $('#c-toc').innerHTML = sec.map(function (s) { return '<li><a href="#r-' + s[0] + '">' + s[1] + '</a></li>'; }).join('');
    var links = $all('#c-toc a');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); }); });
      }, { rootMargin: '-30% 0px -60% 0px' });
      $all('#c-report section').forEach(function (s) { io.observe(s); });
    }
    // Notes added after load inherit the notes switch state through the body class.

    // Related (R25)
    var key = (c.breach[0] || c.nobreach[0] || '');
    var keyTop = key.split('.')[0];
    var byClause = PM.CASES.filter(function (x) { return x.id !== c.id && x.code === c.code && x.breach.concat(x.nobreach).some(function (s) { return s.split('.')[0] === keyTop; }); }).slice(0, 3);
    $('#rel-clause-h').textContent = 'Other cases under Clause ' + keyTop + (c.code === 2024 ? '' : ' (' + c.code + ' Code)');
    $('#rel-clause').innerHTML = byClause.length ? byClause.map(function (x) { return caseCard(x, true); }).join('') + (c.code === 2024 ? '<li><a href="cases.html?clause=' + keyTop + '">All cases under Clause ' + keyTop + '</a></li>' : '') : '<li class="muted">No other cases under this clause in the sample.</li>';
    var byCo = PM.CASES.filter(function (x) { return x.id !== c.id && x.respondent === c.respondent; }).slice(0, 3);
    $('#rel-co-h').textContent = 'Other cases involving ' + c.respondent;
    $('#rel-co').innerHTML = byCo.map(function (x) { return caseCard(x, true); }).join('') + '<li><a href="cases.html?company=' + encodeURIComponent(c.respondent) + '">All cases involving ' + esc(c.respondent) + '</a></li>';

    // Copy, cite, print, follow (R26, R27)
    $('#c-pdf').addEventListener('click', function (e) { e.preventDefault(); WF.toast('The PDF would download here'); });
    $('#c-copy').addEventListener('click', function () { WF.copyText(window.location.href.split('#')[0].split('?')[0] + '?case=' + c.id, function () { WF.toast('Link copied'); }); });
    var cite = 'PMCPA, ' + c.ref + ', ' + parties(c) + ', completed ' + fmtDate(c.completed) + ', ' + c.code + ' ABPI Code of Practice.';
    $('#cite-text').textContent = cite;
    $('#cite-copy').addEventListener('click', function () { WF.copyText(cite, function () { WF.toast('Citation copied'); }); });
    $('#c-print').addEventListener('click', function () { window.print(); });
    var opts = '<label class="check"><input type="checkbox" checked> ' + esc(c.respondent) + '</label>';
    if (c.code === 2024) c.breach.concat(c.nobreach).map(function (s) { return s.split('.')[0]; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).forEach(function (n) { opts += '<label class="check"><input type="checkbox"> Clause ' + n + ' ' + esc(clauseObj(n).title) + '</label>'; });
    $('#follow-options').innerHTML = opts;
    wireSimpleForm('follow-form', 'follow-done');
  }

  /* ======================================================================
     Prototype 3: The Code, connected (R30–R38)
     ====================================================================== */
  function parseClause(v) {
    var m = String(v || '').trim().replace(/^clause\s*/i, '').match(/^(\d{1,2})(?:\.(\d{1,2}))?$/);
    if (!m) return null;
    var n = parseInt(m[1], 10);
    if (n < 1 || n > 31) return null;
    return { top: n, sub: m[2] ? n + '.' + parseInt(m[2], 10) : null };
  }
  function goTo(form) {
    var input = $('#goto-n', form), field = input.closest('.field');
    var c = parseClause(input.value);
    field.classList.toggle('has-error', !c); $('.field-error', field).hidden = !!c;
    if (!c) { input.focus(); return; }
    window.location.href = 'clause.html?clause=' + c.top + (c.sub ? '#c' + c.sub.replace('.', '-') : '');
  }
  function initGoto() {
    var f = $('#goto-form');
    if (!f) return;
    f.addEventListener('submit', function (e) { e.preventDefault(); goTo(f); });
  }

  function initCode() {
    var host = $('#code-sections');
    if (!host) return;
    // Sections as expandable groups with addresses (R32)
    host.innerHTML = PM.SECTIONS.map(function (s) {
      if (s.id === 'P') return '<div class="section-group" id="section-p"><h3><a class="row" style="padding:1rem 1.25rem" href="#"><span class="sec-tag">P</span> ABPI Principles</a></h3></div>';
      var cls = PM.CLAUSES.filter(function (c) { return c.section === s.id; });
      return '<div class="section-group" id="section-' + s.id + '"><h3><button type="button" aria-expanded="false" aria-controls="sec-list-' + s.id + '"><span class="sec-tag">' + s.id + '</span><span>' + esc(s.name.charAt(0).toUpperCase() + s.name.slice(1)) + '</span><span class="range">' + s.range + '</span></button></h3>' +
        '<ol class="clauses" id="sec-list-' + s.id + '" hidden>' + cls.map(function (c) { return '<li><a href="clause.html?clause=' + c.n + '"><span>Clause ' + c.n + '</span><span>' + esc(c.title) + '</span></a></li>'; }).join('') +
        '<li><button type="button" class="btn-link copy-anchor" data-copy-section="' + s.id + '">Copy link to this section</button></li></ol></div>';
    }).join('');
    function setOpen(id, open) {
      var g = document.getElementById('section-' + id); if (!g) return;
      var b = $('h3 button', g); if (!b) return;
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      $('.clauses', g).hidden = !open;
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('h3 button');
      if (b) {
        var id = b.closest('.section-group').id.replace('section-', '');
        var open = b.getAttribute('aria-expanded') !== 'true';
        setOpen(id, open);
        if (open) { try { window.history.replaceState(null, '', '#section-' + id); } catch (err) { /* ignore */ } }
      }
      var cp = e.target.closest('[data-copy-section]');
      if (cp) WF.copyText(window.location.href.split('#')[0] + '#section-' + cp.getAttribute('data-copy-section'), function () { WF.toast('Link to section copied'); });
    });
    var hm = window.location.hash.match(/^#section-(\d)$/);
    if (hm) { setOpen(hm[1], true); var g = document.getElementById('section-' + hm[1]); if (g) g.scrollIntoView(); }

    // Glossary (R36)
    $('#glossary-list').innerHTML = Object.keys(PM.GLOSSARY).map(function (k) { var g = PM.GLOSSARY[k]; return '<dt>' + esc(g.term) + '</dt><dd style="text-align:left;font-weight:400">' + esc(g.def) + '</dd>'; }).join('');

    // One search (R31)
    var tab = 'all', lastQ = '';
    function hl(text, toks) {
      var s = esc(text);
      toks.forEach(function (t) { if (t.length < 2) return; s = s.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); });
      return s;
    }
    function strip(html) { return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
    function search(q) {
      var toks = q.toLowerCase().split(/\s+/).filter(Boolean);
      var phrase = q.toLowerCase().trim();
      var hits = [];
      var cl = parseClause(q);
      function has(text) { var t = text.toLowerCase(); return t.indexOf(phrase) > -1 || toks.every(function (k) { return t.indexOf(k) > -1; }); }
      PM.CLAUSES.forEach(function (c) {
        var ct = PM.CLAUSE_TEXT[String(c.n)];
        if (ct) {
          ct.subs.forEach(function (s) {
            var body = strip(s.text) + ' ' + s.supp.join(' ');
            var exact = cl && (cl.sub === s.n);
            if (exact || has(body) || has('clause ' + s.n + ' ' + c.title)) hits.push({ type: 'Code', rank: exact ? 100 : 10, title: 'Clause ' + s.n + ' · ' + c.title, text: strip(s.text).slice(0, 220), href: 'clause.html?clause=' + c.n + '#c' + s.n.replace('.', '-') });
          });
        } else if ((cl && cl.top === c.n) || has('clause ' + c.n + ' ' + c.title + ' ' + (c.kw || ''))) {
          hits.push({ type: 'Code', rank: cl && cl.top === c.n ? 90 : 8, title: 'Clause ' + c.n + ' · ' + c.title, text: 'Section ' + c.section + ' of the 2024 Code.', href: 'clause.html?clause=' + c.n });
        }
      });
      PM.QAS.forEach(function (x) { if (has(x.q + ' ' + x.topic) || (cl && x.clause.split('.')[0] === String(cl.top) && (!cl.sub || x.clause === cl.sub))) hits.push({ type: 'Q&A', rank: 6, title: x.q, text: 'Clause ' + x.clause + ' · ' + x.topic + ' · Revised ' + x.revised, href: 'clause.html?clause=' + x.clause.split('.')[0] + '#c' + x.clause.replace('.', '-') }); });
      PM.GUIDANCE.forEach(function (x) { if (has(x.t) || (cl && x.clauses.some(function (s) { return s.split('.')[0] === String(cl.top); }))) hits.push({ type: 'Guidance', rank: 5, title: x.t, text: 'Clauses ' + x.clauses.join(', ') + ' · Published [date]', href: '#' }); });
      PM.CASES.forEach(function (x) { if (has(x.headline + ' ' + x.summary + ' ' + x.ref) || (cl && x.code === 2024 && matchesClause(x, cl.sub || String(cl.top)))) hits.push({ type: 'Case', rank: 3, title: x.ref + ' · ' + x.headline, text: parties(x) + ' · ' + OUTCOME_LABEL[outcome(x)] + ' · Completed ' + fmtDate(x.completed), href: 'case.html?case=' + x.id }); });
      hits.sort(function (a, b) { return b.rank - a.rank; });
      return { hits: hits, toks: toks };
    }
    function renderSearch(q) {
      lastQ = q;
      var r = search(q);
      var types = ['all', 'Code', 'Q&A', 'Guidance', 'Case'];
      var labels = { all: 'All', Code: 'Code', 'Q&A': 'Q&As', Guidance: 'Guidance', Case: 'Cases' };
      $('#search-results').hidden = false;
      $('#sr-h').textContent = r.hits.length + ' results for “' + q + '”';
      $('#sr-tabs').innerHTML = types.map(function (t) {
        var n = t === 'all' ? r.hits.length : r.hits.filter(function (h) { return h.type === t; }).length;
        return '<button type="button" role="tab" aria-selected="' + (t === tab ? 'true' : 'false') + '" data-tab-type="' + t + '">' + labels[t] + ' (' + n + ')</button>';
      }).join('');
      var shown = r.hits.filter(function (h) { return tab === 'all' || h.type === tab; });
      $('#sr-list').innerHTML = shown.length ? shown.map(function (h) { return '<li class="hit"><span class="type">' + esc(h.type) + '</span><h3><a href="' + h.href + '">' + hl(h.title, r.toks) + '</a></h3><p>' + hl(h.text, r.toks) + '</p></li>'; }).join('') : '<li class="hit"><p>Nothing in this tab. Try All.</p></li>';
    }
    $('#code-search').addEventListener('submit', function (e) { e.preventDefault(); var q = $('#code-q').value.trim(); if (!q) return; tab = 'all'; renderSearch(q); setQuery({ q: q }); });
    $('#sr-tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-tab-type]'); if (!b) return; tab = b.getAttribute('data-tab-type'); renderSearch(lastQ); var nb = $('#sr-tabs [data-tab-type="' + tab + '"]'); if (nb) nb.focus(); });
    $all('[data-try]').forEach(function (b) { b.addEventListener('click', function () { $('#code-q').value = b.getAttribute('data-try'); tab = 'all'; renderSearch(b.getAttribute('data-try')); setQuery({ q: b.getAttribute('data-try') }); }); });
    var q0 = WF.param('q'); if (q0) { $('#code-q').value = q0; renderSearch(q0); }
  }

  function initClause() {
    var body = $('#cl-body');
    if (!body) return;
    var n = parseInt(WF.param('clause') || '14', 10);
    if (!(n >= 1 && n <= 31)) n = 14;
    var c = PM.CLAUSES[n - 1];
    var sec = PM.SECTIONS.filter(function (s) { return s.id === c.section; })[0];
    document.title = 'Clause ' + n + ' ' + c.title + ' — PMCPA prototype';
    $('#cl-eyebrow').textContent = 'Section ' + sec.id + ' · ' + sec.range;
    $('#cl-title').textContent = 'Clause ' + n + ' ' + c.title;
    $('#idx-section').textContent = 'Section ' + sec.id + ': ' + sec.name;
    $('#idx-list').innerHTML = PM.CLAUSES.filter(function (x) { return x.section === c.section; }).map(function (x) {
      return '<li><a href="clause.html?clause=' + x.n + '"' + (x.n === n ? ' aria-current="page"' : '') + '><span>' + x.n + '</span><span>' + esc(x.title) + '</span></a></li>';
    }).join('');
    $('#idx-toggle').addEventListener('click', function () { var ix = $('#code-index'); var open = !ix.classList.contains('open'); ix.classList.toggle('open', open); this.setAttribute('aria-expanded', open ? 'true' : 'false'); this.textContent = open ? 'Hide clauses in this section' : 'Show clauses in this section'; });

    var ct = PM.CLAUSE_TEXT[String(n)];
    var subs = ct ? ct.subs : [{ n: String(n), text: '<p class="placeholder-text">[Clause ' + n + ' text as published in the 2024 Code.]</p>', supp: [] }];
    if (ct && ct.changed) {
      $('#cl-changed').innerHTML = '<p><span class="changed">Changed in 2024</span> <span class="sample-flag">Illustration</span> <button type="button" class="btn-link" aria-expanded="false" aria-controls="earlier">Show the 2021 wording</button></p><div class="panel surface" id="earlier" hidden><p class="placeholder-text" style="margin:0">[The equivalent wording in the 2021 Code, with changes highlighted.]</p></div>';
      $('#cl-changed button').addEventListener('click', function () { var p = $('#earlier'); p.hidden = !p.hidden; this.setAttribute('aria-expanded', p.hidden ? 'false' : 'true'); this.textContent = p.hidden ? 'Show the 2021 wording' : 'Hide the 2021 wording'; });
    }
    $('#cl-intro').textContent = ct ? ct.intro : '';
    $('#cl-subnav').innerHTML = subs.length > 1 ? subs.map(function (s) { return '<a href="#c' + s.n.replace('.', '-') + '">' + s.n + '</a>'; }).join('') : '';

    function forSub(sn, isWhole) {
      var match = function (tag) { return isWhole ? tag.split('.')[0] === sn : (tag === sn || tag.indexOf(sn + '.') === 0); };
      return {
        qas: PM.QAS.filter(function (x) { return match(x.clause); }),
        guid: PM.GUIDANCE.filter(function (x) { return x.clauses.some(match); }),
        cases: PM.CASES.filter(function (x) { return x.code === 2024 && x.breach.concat(x.nobreach).some(match); }).sort(function (a, b) { return a.completed < b.completed ? 1 : -1; })
      };
    }
    body.innerHTML = subs.map(function (s) {
      var whole = !ct;
      var d = forSub(s.n, whole);
      var supp = s.supp.length ? '<div class="accordion" style="margin-bottom:1rem">' + s.supp.map(function (t) { return '<div class="accordion-item"><button type="button" class="accordion-title">Supplementary information: ' + esc(t) + '<span class="accordion-icon" aria-hidden="true">▾</span></button><div class="accordion-content"><p class="placeholder-text">[Supplementary information as published.]</p></div></div>'; }).join('') + '</div>' : '';
      return '<section class="sub-clause" id="c' + s.n.replace('.', '-') + '" aria-labelledby="h' + s.n.replace('.', '-') + '"><header><h2 id="h' + s.n.replace('.', '-') + '">' + s.n + '</h2><button type="button" class="btn-link copy-anchor" data-copy-sub="' + s.n + '">Copy link to ' + s.n + '</button></header>' +
        '<div class="clause-text">' + s.text + '</div>' + supp +
        '<div class="hub-panels">' +
          '<div class="hub-panel"><h3>Q&amp;As <span class="count">' + d.qas.length + '</span></h3>' + (d.qas.length ? '<ul>' + d.qas.map(function (q) { return '<li><a href="#">' + esc(q.q) + '</a><span class="small">Revised ' + q.revised + '</span></li>'; }).join('') + '</ul>' : '<p class="none">No Q&amp;As on ' + s.n + '.</p>') + '</div>' +
          '<div class="hub-panel"><h3>Guidance <span class="count">' + d.guid.length + '</span></h3>' + (d.guid.length ? '<ul>' + d.guid.map(function (g) { return '<li><a href="#">' + esc(g.t) + '</a><span class="small">Published [date]</span></li>'; }).join('') + '</ul>' : '<p class="none">No guidance on ' + s.n + '.</p>') + '</div>' +
          '<div class="hub-panel"><h3>Cases <span class="count">' + d.cases.length + '</span></h3>' + (d.cases.length ? '<ul>' + d.cases.slice(0, 3).map(function (x) { return '<li><a href="case.html?case=' + x.id + '">' + esc(x.headline) + '</a><span class="small">' + esc(x.ref) + ' · ' + OUTCOME_LABEL[outcome(x)] + ' on ' + (x.breach.some(function (b) { return b === s.n || b.indexOf(s.n + '.') === 0 || (whole && b.split('.')[0] === s.n); }) ? 'this clause' : 'other clauses') + '</span></li>'; }).join('') + '</ul><a class="see-all" href="cases.html?clause=' + s.n + '">See all ' + d.cases.length + ' case' + (d.cases.length === 1 ? '' : 's') + ' under ' + s.n + '</a>' : '<p class="none">No sample cases on ' + s.n + '.</p>') + '</div>' +
        '</div></section>';
    }).join('');
    // Re-run accordion wiring for injected markup
    $all('.accordion-title', body).forEach(function (t) {
      t.setAttribute('aria-expanded', 'false');
      t.addEventListener('click', function () { var it = t.closest('.accordion-item'); var o = !it.classList.contains('open'); it.classList.toggle('open', o); t.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    });
    body.addEventListener('click', function (e) {
      var b = e.target.closest('[data-copy-sub]');
      if (b) WF.copyText(window.location.href.split('#')[0] + '#c' + b.getAttribute('data-copy-sub').replace('.', '-'), function () { WF.toast('Link to ' + b.getAttribute('data-copy-sub') + ' copied'); });
    });
    if (window.location.hash) { var target = document.getElementById(window.location.hash.slice(1)); if (target) window.setTimeout(function () { target.scrollIntoView(); }, 50); }

    // Previous / next clause (R38)
    var pg = '';
    if (n > 1) pg += '<a href="clause.html?clause=' + (n - 1) + '">Previous: Clause ' + (n - 1) + ' ' + esc(PM.CLAUSES[n - 2].title) + '</a>'; else pg += '<span></span>';
    if (n < 31) pg += '<a href="clause.html?clause=' + (n + 1) + '" style="text-align:right">Next: Clause ' + (n + 1) + ' ' + esc(PM.CLAUSES[n].title) + '</a>';
    $('#cl-pager').innerHTML = pg;

    // Glossary popover (R36)
    var pop = $('#gloss-pop'), lastTrig = null;
    function closePop() { if (pop.hidden) return; pop.hidden = true; if (lastTrig) { lastTrig.setAttribute('aria-expanded', 'false'); lastTrig.focus(); } }
    document.addEventListener('click', function (e) {
      var g = e.target.closest('.gloss');
      if (g) {
        var d = PM.GLOSSARY[g.getAttribute('data-term')];
        if (lastTrig === g && !pop.hidden) { closePop(); return; }
        lastTrig = g; g.setAttribute('aria-expanded', 'true');
        pop.innerHTML = '<b>' + esc(d.term) + '</b>' + esc(d.def) + '<br><a href="code.html#gloss-h">Glossary</a>';
        pop.hidden = false;
        var r = g.getBoundingClientRect();
        pop.style.top = (window.scrollY + r.bottom + 6) + 'px';
        pop.style.left = Math.max(8, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - pop.offsetWidth - 8)) + 'px';
      } else if (!e.target.closest('#gloss-pop')) closePop();
    });
    trapEscape(closePop);
  }

  /* ======================================================================
     Prototype 4: Raise a concern (R40–R49)
     ====================================================================== */
  function initConcern() {
    var form = $('#concern-form');
    if (!form) return;
    var step = 1, MAX = 6, returnToReview = false;
    var panels = $all('.step-panel', form);
    var steps = $all('#concern-steps li');
    var companiesList = [];
    var files = [];
    var KEY = 'pm-concern-draft';

    function show(n) {
      step = n;
      panels.forEach(function (p) { p.hidden = parseInt(p.getAttribute('data-step'), 10) !== n; });
      steps.forEach(function (li, i) { li.classList.toggle('current', i + 1 === n); li.classList.toggle('done', i + 1 < n); if (i + 1 === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
      $('#step-back').hidden = n === 1;
      $('#step-next').textContent = n === MAX ? 'Send complaint' : returnToReview ? 'Back to check your answers' : 'Continue';
      if (n === MAX) buildReview();
      var h = $('.step-panel[data-step="' + n + '"] h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    }

    // Scope check (R40, R41)
    var REFER = {
      sidefx: ['Report side effects to the MHRA', 'Side effects are reported through the Yellow Card scheme, run by the MHRA.', 'Go to Yellow Card'],
      pro: ['Contact the professional’s regulator', 'Concerns about an individual doctor, nurse or pharmacist go to the GMC, NMC or GPhC.', 'Find the right regulator'],
      pharmacy: ['Contact the Advertising Standards Authority', 'Advertising by online pharmacies and clinics is usually a matter for the ASA.', 'Go to the ASA'],
      price: ['We can’t help with prices or supply', 'The Code doesn’t cover the price or availability of medicines. Your GP, pharmacist or local NHS can advise.', 'NHS help with medicines']
    };
    function scope() {
      var what = (form.querySelector('[name="what"]:checked') || {}).value;
      var who = (form.querySelector('[name="who"]:checked') || {}).value;
      var box = $('#scope-result');
      if (!what) { box.hidden = true; return null; }
      if (REFER[what]) {
        var r = REFER[what];
        box.className = 'scope-result out'; box.hidden = false;
        box.innerHTML = '<h3>' + r[0] + '</h3><p>' + r[1] + '</p><p><a href="#">' + r[2] + '</a></p><p class="wf-meta">Not sure? <a href="#">Email us for informal advice</a>.</p>';
        return 'out';
      }
      box.className = 'scope-result'; box.hidden = false;
      var extra = who === 'company' ? '<p>As a company, you’ll need to have tried intercompany dialogue first. We’ll ask about that later.</p>' : who === 'employee' ? '<p>If you work for the company, you may want to try its whistleblowing policy first. You can still continue.</p>' : '';
      box.innerHTML = '<h3>This sounds like something we can look at</h3><p>Continue to tell us what happened. It takes about 10 minutes.</p>' + extra;
      return 'in';
    }
    form.addEventListener('change', function (e) {
      if (e.target.name === 'what' || e.target.name === 'who') {
        var r = scope();
        $('#step-next').disabled = r === 'out';
        $('#step-next').setAttribute('aria-disabled', r === 'out' ? 'true' : 'false');
        // Carry answers into later steps (R41)
        var who = (form.querySelector('[name="who"]:checked') || {}).value;
        var role = $('#role');
        if (who === 'company') role.value = 'company';
        else if (who === 'admission') role.value = 'admission';
        else if (who === 'employee' && ['employee', 'ex'].indexOf(role.value) === -1) role.value = 'employee';
        else if (who === 'outside' && ['company', 'admission', 'employee', 'ex'].indexOf(role.value) > -1) role.value = '';
        roleChanged();
      }
      if (e.target.name === 'interest') { $('#interest-detail-field').hidden = e.target.value !== 'yes'; }
      if (e.target.id === 'role') roleChanged();
      if (e.target.id === 'files') addFiles(e.target.files);
      save();
    });
    function roleChanged() {
      var v = $('#role').value;
      $('#role-other-field').hidden = v !== 'other';
      $('#dialogue-block').hidden = v !== 'company';
      $('#whistle-block').hidden = ['employee', 'ex'].indexOf(v) === -1;
    }

    // Company tags (R42)
    var coInput = $('#co-input');
    function renderTags() {
      $all('.tag', $('#co-tags')).forEach(function (t) { t.remove(); });
      companiesList.forEach(function (c, i) {
        var s = document.createElement('span'); s.className = 'tag';
        s.innerHTML = esc(c) + '<button type="button" aria-label="Remove ' + esc(c) + '" data-tag="' + i + '">×</button>';
        $('#co-tags').insertBefore(s, coInput);
      });
      $('#co-value').value = companiesList.join(', ');
    }
    function addCo() { var v = coInput.value.replace(/,$/, '').trim(); if (v && companiesList.indexOf(v) === -1) { companiesList.push(v); renderTags(); save(); } coInput.value = ''; }
    coInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addCo(); }
      if (e.key === 'Backspace' && !coInput.value && companiesList.length) { companiesList.pop(); renderTags(); }
    });
    coInput.addEventListener('blur', addCo);
    $('#co-tags').addEventListener('click', function (e) { var b = e.target.closest('[data-tag]'); if (b) { companiesList.splice(parseInt(b.getAttribute('data-tag'), 10), 1); renderTags(); coInput.focus(); } else coInput.focus(); });

    $('#details').addEventListener('input', function () { $('#details-count').textContent = this.value.length + ' characters'; });

    // Evidence (R42): 5 files, 20MB in total
    function addFiles(list) {
      var err = '';
      Array.prototype.forEach.call(list, function (f) {
        if (files.length >= 5) { err = 'You can add up to 5 files. Email any others to complaints@pmcpa.org.uk.'; return; }
        var total = files.reduce(function (a, b) { return a + b.size; }, 0);
        if (total + f.size > 20 * 1024 * 1024) { err = f.name + ' would take you over 20MB. Email it to complaints@pmcpa.org.uk instead.'; return; }
        files.push({ name: f.name, size: f.size });
      });
      $('#file-error').textContent = err; $('#file-error').hidden = !err;
      $('#files').value = '';
      renderFiles();
    }
    function renderFiles() {
      $('#file-list').innerHTML = files.map(function (f, i) { return '<li><span>' + esc(f.name) + ' <span class="muted">(' + Math.max(1, Math.round(f.size / 1024)) + 'KB)</span></span><button type="button" class="btn-link" data-file="' + i + '">Remove</button></li>'; }).join('');
    }
    $('#file-list').addEventListener('click', function (e) { var b = e.target.closest('[data-file]'); if (b) { files.splice(parseInt(b.getAttribute('data-file'), 10), 1); renderFiles(); } });

    function validStep(n) {
      var panel = $('.step-panel[data-step="' + n + '"]');
      var ok = true, first = null;
      if (n === 1) {
        ['what', 'who'].forEach(function (name) {
          var fs = panel.querySelector('[name="' + name + '"]').closest('fieldset');
          var on = !!panel.querySelector('[name="' + name + '"]:checked');
          $('.field-error', fs).hidden = on; if (!on) { ok = false; first = first || panel.querySelector('[name="' + name + '"]'); }
        });
        if (ok && scope() === 'out') ok = false;
        if (first) first.focus();
        return ok;
      }
      if (n === 2) addCo();
      ok = WF.validateForm(wrap(panel));
      if (n === 2 && !companiesList.length) coInput.focus();
      if (n === 4 && ok) {
        var f2 = $('#email2').closest('.field'), same = $('#email').value.trim() === $('#email2').value.trim();
        f2.classList.toggle('has-error', !same); $('.field-error', f2).hidden = same;
        if (!same) { $('#email2').focus(); ok = false; }
      }
      return ok;
    }
    /* Validate only the fields in the visible panel, using the shared validator. */
    function wrap(panel) { return { querySelector: function (s) { return form.querySelector(s); }, querySelectorAll: function (s) { return panel.querySelectorAll(s); } }; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validStep(step)) return;
      if (step < MAX) {
        if (returnToReview) { returnToReview = false; show(MAX); }
        else show(step + 1);
        save();
        window.scrollTo({ top: $('#concern-steps').getBoundingClientRect().top + window.scrollY - 120 });
        return;
      }
      // Send (R47)
      form.hidden = true; $('#concern-steps').hidden = true;
      var done = $('#concern-done'); done.hidden = false;
      $('#done-ref').textContent = 'PMCPA-' + (Math.floor(Math.random() * 9000) + 1000);
      $('#done-email').textContent = $('#email').value;
      try { window.sessionStorage.removeItem(KEY); } catch (err) { /* ignore */ }
      $('h2', done).focus();
    });
    $('#step-back').addEventListener('click', function () { returnToReview = false; show(step - 1); });

    // Review with edit links (R44)
    function val(id) { var el = document.getElementById(id); return el && el.value ? el.value : '—'; }
    function radioLabel(name) { var r = form.querySelector('[name="' + name + '"]:checked'); return r ? r.closest('label').querySelector('strong') ? r.closest('label').querySelector('strong').textContent : r.closest('label').textContent.trim() : '—'; }
    function buildReview() {
      var roleSel = $('#role'); var role = roleSel.value ? roleSel.options[roleSel.selectedIndex].text : '—';
      var blocks = [
        [1, 'Check we can help', [['Concern about', radioLabel('what')], ['You are', radioLabel('who')]]],
        [2, 'The matter', [['Companies', companiesList.join(', ') || '—'], ['Medicine', val('med')], ['Where', val('where')], ['When', $('#when').value ? fmtDate($('#when').value) : '—'], ['What happened', val('details')], ['Links', val('links')]]],
        [3, 'Evidence', [['Files', files.length ? files.map(function (f) { return f.name; }).join(', ') : 'None'], ['More by email', $('#email-evidence').checked ? 'Yes' : 'No']]],
        [4, 'About you', [['Name', $('#name').value || 'Not given (anonymous)'], ['Email', val('email')], ['Role', role + ($('#role').value === 'other' ? ': ' + val('role-other') : '')]]],
        [5, 'Your interests', [['Interest declared', radioLabel('interest')], ['Details', $('#interest-detail-field').hidden ? '—' : val('interest-detail')]].concat($('#role').value === 'company' ? [['Intercompany dialogue', $('#dialogue').checked ? 'Attempted' : 'Not confirmed']] : [])]
      ];
      $('#review-list').innerHTML = blocks.map(function (b) {
        return '<div class="review-block"><header><h3>' + b[1] + '</h3><button type="button" class="btn-link" data-edit="' + b[0] + '">Change<span class="visually-hidden"> ' + b[1] + '</span></button></header><dl>' + b[2].map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl></div>';
      }).join('');
    }
    $('#review-list').addEventListener('click', function (e) { var b = e.target.closest('[data-edit]'); if (b) { returnToReview = true; show(parseInt(b.getAttribute('data-edit'), 10)); } });

    // Save and finish later (R48): kept in sessionStorage for the prototype
    var FIELDS = ['med', 'where', 'when', 'details', 'links', 'name', 'role', 'role-other', 'email', 'email2', 'interest-detail'];
    function save() {
      var d = { step: step, companies: companiesList, fields: {}, radios: {}, checks: { 'email-evidence': $('#email-evidence').checked, dialogue: $('#dialogue').checked } };
      FIELDS.forEach(function (id) { d.fields[id] = $('#' + id).value; });
      ['what', 'who', 'interest'].forEach(function (n) { var r = form.querySelector('[name="' + n + '"]:checked'); if (r) d.radios[n] = r.value; });
      try { window.sessionStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* ignore */ }
    }
    function restore(d) {
      companiesList = d.companies || []; renderTags();
      Object.keys(d.fields || {}).forEach(function (id) { var el = $('#' + id); if (el) el.value = d.fields[id]; });
      Object.keys(d.radios || {}).forEach(function (n) { var r = form.querySelector('[name="' + n + '"][value="' + d.radios[n] + '"]'); if (r) r.checked = true; });
      $('#email-evidence').checked = !!(d.checks && d.checks['email-evidence']); $('#dialogue').checked = !!(d.checks && d.checks.dialogue);
      $('#interest-detail-field').hidden = d.radios.interest !== 'yes';
      $('#details-count').textContent = $('#details').value.length + ' characters';
      scope(); roleChanged(); show(d.step || 1);
    }
    form.addEventListener('input', save);
    $('#save-later').addEventListener('click', function () { save(); $('#save-form').hidden = false; $('#save-done').hidden = true; WF.openModal('save-modal'); });
    wireSimpleForm('save-form', 'save-done');
    try {
      var draft = JSON.parse(window.sessionStorage.getItem(KEY) || 'null');
      if (draft && (draft.step > 1 || (draft.radios && draft.radios.what))) {
        $('#resume-banner').hidden = false;
        $('#resume-btn').addEventListener('click', function () { $('#resume-banner').hidden = true; restore(draft); });
        $('#discard-btn').addEventListener('click', function () { $('#resume-banner').hidden = true; window.sessionStorage.removeItem(KEY); });
      }
    } catch (e) { /* ignore */ }
    steps[0].setAttribute('aria-current', 'step');
  }

  /* ======================================================================
     Prototype 5: Open by default (R50–R57)
     ====================================================================== */
  function initHome() {
    var strip = $('#latest-rulings');
    if (!strip) return;
    var latest = PM.CASES.slice().sort(function (a, b) { return a.completed < b.completed ? 1 : -1; }).slice(0, 3);
    strip.innerHTML = latest.map(function (c) {
      return '<li><div class="row between"><span class="wf-meta">' + esc(c.ref) + '</span>' + pill(c) + '</div><a href="case.html?case=' + c.id + '"><strong>' + esc(c.headline) + '</strong></a><span class="wf-meta">' + esc(parties(c)) + ' · Completed ' + fmtDate(c.completed) + '</span></li>';
    }).join('');
    $('#training-dates').innerHTML = PM.TRAINING.map(function (t) {
      var s = t.status === 'full' ? '<span class="status full">Fully booked</span>' : t.status === 'past' ? '<span class="status past">Took place</span>' : '<span class="status">Places available</span>';
      return '<li><span>' + t.date + '</span>' + s + '</li>';
    }).join('');
    wireSimpleForm('wait-form', 'wait-done');
  }

  function initPerformance() {
    var cr = $('#chart-rulings');
    if (!cr) return;
    function bars(host, rows) {
      var max = Math.max.apply(null, rows.map(function (r) { return r.value; }));
      host.innerHTML = rows.map(function (r) { return '<div class="chart-row"><span>' + r.label + '</span><span class="track" aria-hidden="true"><span class="fill" style="width:' + Math.round(r.value / max * 100) + '%;display:block"></span></span><b>' + r.value + '</b></div>'; }).join('');
    }
    bars(cr, PM.PERFORMANCE.rulings);
    bars($('#chart-open'), PM.PERFORMANCE.open);

    // Snapshot table with labelled totals and change (R55)
    var snaps = PM.PERFORMANCE.snapshots, keys = Object.keys(snaps).sort().reverse();
    $('#snap').innerHTML = keys.map(function (k) { return '<option value="' + k + '">' + snaps[k].label + '</option>'; }).join('');
    function table(k) {
      var s = snaps[k], i = keys.indexOf(k), prev = snaps[keys[i + 1]];
      function row(label, key, cls) {
        var v = typeof key === 'function' ? key(s) : s[key];
        var pv = prev ? (typeof key === 'function' ? key(prev) : prev[key]) : null;
        var ch = pv == null ? '—' : (v - pv === 0 ? 'no change' : (v - pv > 0 ? '+' : '−') + Math.abs(v - pv));
        return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><th scope="row">' + label + '</th><td class="n">' + v + '</td><td class="n">' + ch + '</td></tr>';
      }
      var waiting = function (x) { return x.prep + x.panel + x.assigned; };
      var all = function (x) { return waiting(x) + x.undertaking + x.appeal + x.sanction; };
      $('#pipeline').innerHTML = '<caption class="visually-hidden">Cases at each stage, ' + s.label + '</caption><thead><tr><th scope="col">Stage</th><th scope="col" class="n">Cases</th><th scope="col" class="n">Change since ' + (prev ? prev.label : 'previous') + '</th></tr></thead><tbody>' +
        row('Case preparation', 'prep') + row('Referred to the Panel, not yet assigned', 'panel') + row('Assigned to Panel members', 'assigned') +
        row('Awaiting a decision or Panel ruling', waiting, 'sub') +
        row('Awaiting the undertaking or an appeal', 'undertaking') + row('Processing appeal', 'appeal') + row('Sanction in progress', 'sanction') +
        row('All open cases', all, 'total') + '</tbody>';
    }
    table(keys[0]);
    $('#snap').addEventListener('change', function () { table(this.value); });

    // Ongoing cases with status track and follow (R56)
    var labels = PM.STAGES.slice(1);
    $('#ongoing-list').innerHTML = PM.ONGOING.map(function (o, idx) {
      return '<li><div class="top"><div><span class="wf-meta">' + esc(o.ref) + '</span><h3 class="h-sm" style="margin:0">' + esc(o.title) + '</h3></div>' + (o.outcome ? '<span class="pill ' + (o.outcome === 'Breach ruled' ? 'breach' : 'nobreach') + '">' + o.outcome + '</span>' : '<span class="pill pending">Not yet ruled</span>') + '</div>' +
        '<ol class="track-steps" aria-label="Status">' + labels.map(function (l, i) { var st = i + 1 < o.stage ? 'done' : i + 1 === o.stage ? 'now' : ''; return '<li class="' + st + '"' + (st === 'now' ? ' aria-current="step"' : '') + '>' + l + '</li>'; }).join('') + '</ol>' +
        '<div class="row between"><span class="wf-meta">Received ' + fmtDate(o.received) + ' · Last updated ' + fmtDate(o.updated) + '</span><button type="button" class="btn btn-secondary btn-sm" data-follow="' + idx + '">Follow this case</button></div></li>';
    }).join('');
    $('#ongoing-list').addEventListener('click', function (e) {
      var b = e.target.closest('[data-follow]'); if (!b) return;
      var o = PM.ONGOING[parseInt(b.getAttribute('data-follow'), 10)];
      $('#fo-case').textContent = o.ref + ' · ' + o.title;
      $('#fo-form').hidden = false; $('#fo-done').hidden = true;
      WF.openModal('follow-modal');
    });
    wireSimpleForm('fo-form', 'fo-done');
  }

  function initAlerts() {
    var f = $('#prefs-form');
    if (!f) return;
    $('#pref-sections').innerHTML = PM.SECTIONS.slice(1).map(function (s) { return '<label class="check"><input type="checkbox" name="sec" value="' + s.id + '"> <span>Section ' + s.id + ' · ' + s.range + '<small class="muted">' + esc(s.name.charAt(0).toUpperCase() + s.name.slice(1)) + '</small></span></label>'; }).join('');
    var picked = [];
    $('#pref-co').innerHTML += companies().map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');
    $('#pref-co').addEventListener('change', function () { if (this.value && picked.indexOf(this.value) === -1) picked.push(this.value); this.value = ''; renderPicked(); sample(); });
    function renderPicked() { $('#pref-co-picked').innerHTML = picked.map(function (c, i) { return '<button type="button" class="chip" data-unpick="' + i + '">' + esc(c) + ' ×</button>'; }).join(''); }
    $('#pref-co-picked').addEventListener('click', function (e) { var b = e.target.closest('[data-unpick]'); if (b) { picked.splice(parseInt(b.getAttribute('data-unpick'), 10), 1); renderPicked(); sample(); } });

    function sample() {
      var types = $all('[name="type"]:checked', f).map(function (x) { return x.value; });
      var secs = $all('[name="sec"]:checked', f).map(function (x) { return x.value; });
      var freq = (f.querySelector('[name="freq"]:checked') || {}).value;
      var since = new Date(TODAY); since.setMonth(since.getMonth() - (freq === 'month' ? 1 : 3));
      var items = [];
      if (types.indexOf('cases') > -1 || types.indexOf('sanctions') > -1) {
        PM.CASES.forEach(function (c) {
          if (new Date(c.completed) < since) return;
          if (picked.length && picked.indexOf(c.respondent) === -1) return;
          if (secs.length && !c.breach.concat(c.nobreach).some(function (s) { var cl = clauseObj(s); return c.code === 2024 && cl && secs.indexOf(cl.section) > -1; })) return;
          if (types.indexOf('cases') > -1) items.push('<li><strong>New case:</strong> <a href="case.html?case=' + c.id + '">' + esc(c.ref) + ' ' + esc(c.headline) + '</a><br><span class="wf-meta">' + esc(parties(c)) + ' · ' + OUTCOME_LABEL[outcome(c)] + '</span></li>');
          else if (c.sanctions.some(function (s) { return s !== 'Undertaking'; })) items.push('<li><strong>Sanction:</strong> ' + esc(c.sanctions.filter(function (s) { return s !== 'Undertaking'; }).join(', ')) + ' for ' + esc(c.respondent) + ' (' + esc(c.ref) + ')</li>');
        });
      }
      if (types.indexOf('guidance') > -1) items.push('<li><strong>Q&amp;A updated:</strong> What are the expectations with regards to using data on file?</li>');
      if (types.indexOf('training') > -1) items.push('<li><strong>Training:</strong> new ABPI Code training dates announced for [2027]</li>');
      if (types.indexOf('press') > -1) items.push('<li><strong>Press release:</strong> Brightwater Pharma ruled in breach of Clause 2 (CASE/9068/02/26)</li>');
      if (types.indexOf('pmcpa') > -1) items.push('<li><strong>Consultation:</strong> [Title of the next consultation]</li>');
      var label = { each: 'New from the PMCPA', week: 'Your weekly PMCPA summary', month: 'Your monthly PMCPA summary' }[freq];
      $('#sa-subject').textContent = label + (items.length ? ' (' + items.length + ')' : '');
      $('#sa-body').innerHTML = items.length ? '<ul>' + items.slice(0, 6).join('') + '</ul>' + (items.length > 6 ? '<p class="wf-meta">and ' + (items.length - 6) + ' more</p>' : '') : '<p class="empty">Nothing matched these choices recently. You would still get the alert when something does.</p>';
    }
    f.addEventListener('change', sample);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var tf = $('#types-field'), any = !!f.querySelector('[name="type"]:checked');
      tf.classList.toggle('has-error', !any); $('.field-error', tf).hidden = any;
      if (!any) { f.querySelector('[name="type"]').focus(); return; }
      if (!WF.validateForm(f)) return;
      $('#prefs-done').hidden = false; $('#prefs-done h2').focus();
    });
    sample();
  }

  /* Module library demos */
  function initLibrary() {
    var host = $('#lib-case');
    if (!host) return;
    var c = caseById('9064');
    host.innerHTML = '<li class="case-result"><div class="top"><span class="ref">' + esc(c.ref) + '</span>' + pill(c) + '</div><h3><a href="../pages/case.html?case=' + c.id + '">' + esc(c.headline) + '</a></h3><p class="parties">' + esc(parties(c)) + '</p><p class="sum">' + esc(c.summary) + '</p>' + chipsFor(c).replace(/href="clause/g, 'href="../pages/clause') + '</li>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFinder();
    initCase();
    initCode();
    initGoto();
    initClause();
    initConcern();
    initHome();
    initPerformance();
    initAlerts();
    initLibrary();
  });
})();
