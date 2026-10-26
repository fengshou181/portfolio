/* ============ AI COPILOT WIDGET ============
 * 全站 AI Copilot 外壳：状态机 READY/THINKING/VALIDATING/QUERYING/RESULT/EMPTY/ERROR/OFFLINE。
 * 后端未配置时使用 mock 数据演示；配置 window.AI_COPILOT_CONFIG = { apiBase: 'https://...' }
 * 后自动调用 FastAPI 网关（POST /api/chat，SSE）。
 */
(function () {
  'use strict';

  // 幂等守卫：防止页面同时直接引用与 common.js 动态注入导致的双实例
  if (window.AICopilot) return;

  // Inject stylesheet once
  if (!document.getElementById('ai-copilot-css')) {
    var link = document.createElement('link');
    link.id = 'ai-copilot-css';
    link.rel = 'stylesheet';
    link.href = 'ai-copilot.css?v=20261027b';
    document.head.appendChild(link);
  }

  var CFG = window.AI_COPILOT_CONFIG || {};
  var API_BASE = CFG.apiBase || '';

  // ---------- DOM ----------
  var launch = document.createElement('button');
  launch.className = 'aic-launch';
  launch.type = 'button';
  launch.setAttribute('aria-label', '打开 AI Copilot');
  launch.innerHTML = 'AI Copilot<span class="aic-dot"></span>';

  var panel = document.createElement('div');
  panel.className = 'aic-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'AI 数据分析 Copilot');
  panel.innerHTML =
    '<div class="aic-head">' +
      '<span class="aic-head-title">AI Copilot</span>' +
      '<span class="aic-state" id="aicState" data-state="READY">READY</span>' +
      '<button class="aic-close" id="aicClose" aria-label="关闭">✕</button>' +
    '</div>' +
    '<div class="aic-body" id="aicBody">' +
      '<div class="aic-empty"><div class="big">◈</div>' +
      '用中文向电商数仓提问<br>回答包含 数据来源 · 口径 · SQL · 耗时</div>' +
    '</div>' +
    '<div class="aic-quick" id="aicQuick">' +
      '<button data-q="查看 Olist 已交付订单的 GMV">查看已交付 GMV</button>' +
      '<button data-q="比较四个数据集的订单量">比较各数据集订单量</button>' +
      '<button data-q="分析淘宝用户行为转化率变化">分析转化率变化</button>' +
    '</div>' +
    '<div class="aic-input-row">' +
      '<input class="aic-input" id="aicInput" type="text" maxlength="500" placeholder="> 询问数仓，Enter 发送" aria-label="问题输入">' +
      '<button class="aic-send" id="aicSend">发送</button>' +
    '</div>';

  var stateEl = panel.querySelector('#aicState');
  var bodyEl = panel.querySelector('#aicBody');
  var inputEl = panel.querySelector('#aicInput');
  var sendEl = panel.querySelector('#aicSend');
  var quickEl = panel.querySelector('#aicQuick');
  var closeEl = panel.querySelector('#aicClose');

  document.body.appendChild(launch);
  document.body.appendChild(panel);

  function setState(s) {
    stateEl.dataset.state = s;
    stateEl.textContent = s;
    if (s === 'OFFLINE') launch.classList.add('offline');
    else launch.classList.remove('offline');
  }

  function open() {
    panel.classList.add('open');
    launch.classList.add('hidden');
    setTimeout(function () { inputEl.focus(); }, 300);
  }
  function close() {
    panel.classList.remove('open');
    launch.classList.remove('hidden');
  }
  launch.addEventListener('click', open);
  closeEl.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) close();
  });

  // ---------- Rendering ----------
  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.firstElementChild;
  }
  function clearEmpty() {
    var e = bodyEl.querySelector('.aic-empty');
    if (e) e.remove();
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function addQuestion(q) {
    clearEmpty();
    bodyEl.appendChild(el('<div class="aic-qa"><div class="aic-q"><span class="p">&gt;</span><span></span></div></div>'));
    var qa = bodyEl.lastElementChild;
    qa.querySelector('.aic-q span:last-child').textContent = q;
    var a = document.createElement('div');
    a.className = 'aic-a';
    qa.appendChild(a);
    bodyEl.scrollTop = bodyEl.scrollHeight;
    return a;
  }

  function renderSteps(container, steps) {
    var box = el('<div class="aic-steps"></div>');
    steps.forEach(function (name) {
      box.appendChild(el('<div class="aic-step" data-step="' + name + '"><span class="st-dot"></span><span>' + name + '</span></div>'));
    });
    container.appendChild(box);
    return box;
  }
  function markStep(box, name, done) {
    var s = box.querySelector('[data-step="' + name + '"]');
    if (!s) return;
    s.classList.remove('active');
    s.classList.add(done ? 'done' : 'active');
  }

  function renderAnswer(container, r) {
    var html = '<div class="aic-answer-summary">' + escapeHtml(r.answer || '') + '</div>';
    if (r.rows && r.rows.length && r.columns) {
      html += '<div class="aic-table-wrap"><table class="aic-table"><thead><tr>';
      r.columns.forEach(function (c) { html += '<th>' + escapeHtml(c) + '</th>'; });
      html += '</tr></thead><tbody>';
      r.rows.slice(0, 20).forEach(function (row) {
        html += '<tr>' + row.map(function (v) { return '<td>' + escapeHtml(v) + '</td>'; }).join('') + '</tr>';
      });
      html += '</tbody></table></div>';
      if (r.rows.length > 20) html += '<div class="aic-meta">显示前 20 / ' + r.rows.length + ' 行</div>';
    }
    html += '<div class="aic-meta">' +
      (r.source ? '<span>来源 <b>' + escapeHtml(r.source) + '</b></span>' : '') +
      (r.metric_definition ? '<span>口径 <b>' + escapeHtml(r.metric_definition) + '</b></span>' : '') +
      (r.elapsed_ms != null ? '<span>耗时 <b>' + r.elapsed_ms + 'ms</b></span>' : '') +
      '<span>快照 <b>2026-10-18</b></span></div>';
    if (r.sql) {
      html += '<div class="aic-sql"><button class="aic-sql-toggle" type="button">查看 SQL<span>▸</span></button>' +
        '<pre>' + escapeHtml(r.sql) + '</pre></div>';
    }
    html += '<div class="aic-actions">' +
      (r.sql ? '<button class="aic-btn" data-act="copy">复制 SQL</button>' : '') +
      '<button class="aic-btn primary" data-act="follow">继续追问</button></div>';
    container.innerHTML = html;

    var sqlBox = container.querySelector('.aic-sql');
    if (sqlBox) {
      sqlBox.querySelector('.aic-sql-toggle').addEventListener('click', function () {
        sqlBox.classList.toggle('open');
      });
    }
    var copyBtn = container.querySelector('[data-act="copy"]');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (navigator.clipboard) navigator.clipboard.writeText(r.sql);
        copyBtn.textContent = '已复制 ✓';
        setTimeout(function () { copyBtn.textContent = '复制 SQL'; }, 1500);
      });
    }
    var followBtn = container.querySelector('[data-act="follow"]');
    if (followBtn) followBtn.addEventListener('click', function () { inputEl.focus(); });
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  // ---------- Mock mode ----------
  var MOCKS = [
    {
      match: /GMV|gmv|销售额/,
      r: {
        answer: '结论：Olist 已交付订单 GMV 为 1,584 万雷亚尔（R$ 15,842,000），覆盖 96,478 笔 delivered 订单。',
        columns: ['delivered_gmv', 'orders'],
        rows: [['R$ 15,842,009.12', '96,478']],
        sql: "SELECT ROUND(SUM(price + freight_value), 2) AS delivered_gmv,\n       COUNT(DISTINCT order_id) AS orders\nFROM olist.olist_order_item_wide\nWHERE order_status = 'delivered';",
        source: 'olist.olist_order_item_wide',
        metric_definition: "order_status = 'delivered'，SUM(price + freight_value)，含运费",
        elapsed_ms: 1420
      }
    },
    {
      match: /转化|conversion/,
      r: {
        answer: '结论：淘宝用户行为整体 PV→购买转化率 2.25%，加购→购买转化约 36.4%，符合电商 2-5% 的常见区间。',
        columns: ['behavior', 'cnt', 'rate'],
        rows: [['浏览 pv', '89,716,264', '100%'], ['加购 cart', '5,530,446', '6.17%'], ['收藏 fav', '2,888,258', '3.22%'], ['购买 buy', '2,015,839', '2.25%']],
        sql: "SELECT behavior_type, COUNT(*) AS cnt,\n       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS rate\nFROM taobao.user_behavior_wide\nGROUP BY behavior_type\nORDER BY cnt DESC;",
        source: 'taobao.user_behavior_wide',
        metric_definition: 'behavior_type 计数占比，宽表 1 亿行',
        elapsed_ms: 2380
      }
    },
    {
      match: /订单量|订单数|比较/,
      r: {
        answer: '结论：四个数据集中淘宝行为记录最多（1 亿条），Instacart 商品项 3,346 万，Amazon 评论 40.9 万，Olist 订单 9.9 万。',
        columns: ['dataset', 'records'],
        rows: [['taobao', '100,000,000'], ['instacart', '33,460,842'], ['amazon', '409,961'], ['olist', '99,441']],
        sql: "SELECT 'olist' AS dataset, COUNT(*) AS records FROM olist.olist_orders_wide\nUNION ALL SELECT 'amazon', COUNT(*) FROM amazon.amazon_reviews_wide\nUNION ALL SELECT 'instacart', COUNT(*) FROM instacart.instacart_orders_wide\nUNION ALL SELECT 'taobao', COUNT(*) FROM taobao.user_behavior_wide\nORDER BY records DESC;",
        source: '4 张宽表 UNION',
        metric_definition: '各宽表 COUNT(*)',
        elapsed_ms: 1980
      }
    }
  ];

  function mockAnswer(q) {
    for (var i = 0; i < MOCKS.length; i++) {
      if (MOCKS[i].match.test(q)) return MOCKS[i].r;
    }
    return {
      answer: '结论：已在知识库中检索到相关表结构。当前为演示模式（未配置 AI 网关），完整回答需部署 server/ FastAPI 服务后可用。',
      columns: null, rows: null, sql: null,
      source: 'mock', metric_definition: '演示数据', elapsed_ms: 320
    };
  }

  function runMock(container, q) {
    var steps = renderSteps(container, ['THINKING', 'VALIDATING', 'QUERYING']);
    var seq = [
      ['THINKING', 500, function () { markStep(steps, 'THINKING', true); markStep(steps, 'VALIDATING'); setState('VALIDATING'); }],
      ['VALIDATING', 450, function () { markStep(steps, 'VALIDATING', true); markStep(steps, 'QUERYING'); setState('QUERYING'); }],
      ['QUERYING', 750, function () { markStep(steps, 'QUERYING', true); setState('RESULT'); renderAnswer(container, mockAnswer(q)); }]
    ];
    var i = 0;
    (function next() {
      if (i >= seq.length) return;
      var s = seq[i++];
      setState(s[0]);
      s[2]();
      setTimeout(next, s[1]);
    })();
    setState('THINKING');
    markStep(steps, 'THINKING');
  }

  // ---------- Real API mode (SSE) ----------
  function runApi(container, q, context) {
    var sessionId = 'sess_' + Date.now().toString(36);
    fetch(API_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, question: q, context: context || {}, stream: true })
    }).then(function (resp) {
      if (!resp.ok || !resp.body) throw new Error('HTTP ' + resp.status);
      var reader = resp.body.getReader();
      var decoder = new TextDecoder();
      var buf = '';
      function handleEvent(evt, data) {
        try { data = JSON.parse(data); } catch (e) { return; }
        if (evt === 'status') {
          setState(data.state || 'THINKING');
        } else if (evt === 'result') {
          setState('RESULT');
          renderAnswer(container, data);
        } else if (evt === 'error') {
          setState('ERROR');
          container.appendChild(el('<div class="aic-banner">' + escapeHtml(data.message || '查询失败') + '</div>'));
        }
      }
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) return;
          buf += decoder.decode(r.value, { stream: true });
          var blocks = buf.split('\n\n');
          buf = blocks.pop();
          blocks.forEach(function (b) {
            var evt = 'message', data = '';
            b.split('\n').forEach(function (line) {
              if (line.indexOf('event:') === 0) evt = line.slice(6).trim();
              else if (line.indexOf('data:') === 0) data += line.slice(5).trim();
            });
            handleEvent(evt, data);
          });
          return pump();
        });
      }
      return pump();
    }).catch(function (err) {
      setState('ERROR');
      container.appendChild(el('<div class="aic-banner">AI 网关不可达（' + escapeHtml(err.message) +
        '）。请确认 server/ 服务已启动；看板静态快照不受影响。</div>'));
    });
  }

  // ---------- Submit ----------
  var lastContext = null;
  function ask(q, context) {
    q = (q || '').trim();
    if (!q) return;
    var container = addQuestion(q);
    if (API_BASE) runApi(container, q, context || lastContext);
    else runMock(container, q);
    inputEl.value = '';
  }

  sendEl.addEventListener('click', function () { ask(inputEl.value); });
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') ask(inputEl.value);
  });
  quickEl.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-q]');
    if (b) ask(b.dataset.q);
  });

  // Health probe → OFFLINE badge when configured but unreachable
  if (API_BASE) {
    fetch(API_BASE + '/api/health').then(function (r) {
      if (!r.ok) throw new Error('bad status');
      return r.json();
    }).then(function (h) {
      if (h && h.status !== 'ready') setState('OFFLINE');
    }).catch(function () { setState('OFFLINE'); });
  }

  // ---------- Public API ----------
  window.AICopilot = {
    open: function (question, context) {
      open();
      if (question) {
        lastContext = context || null;
        ask(question, context);
      }
    },
    close: close,
    toggle: function () { panel.classList.contains('open') ? close() : open(); }
  };
})();
