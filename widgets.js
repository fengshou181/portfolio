/* Side Widgets — 时钟/一言/待办/每日一签/站点统计（纯本地，无网络依赖） */
(function () {
  'use strict';

  /* ---------- 工具：按日期取稳定随机 ---------- */
  function dailyIndex(len, salt) {
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + (salt || 0);
    return seed % len;
  }
  const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  /* ---------- 数据：每日一言 ---------- */
  const QUOTES = [
    ['数据不会说谎，但会沉默。', '丰年'],
    ['先把表建对，再谈智能。', '数仓信条'],
    ['每一条 SQL 都是一次承诺。', 'ETL 手记'],
    ['好的看板让问题自己站出来。', 'BI 心得'],
    ['慢查询是沉默的债。', '调优笔记'],
    ['口径不一致的指标，比没有指标更危险。', '数据治理'],
    ['自动化一次，就永远不用再做第二次。', '工程直觉'],
    ['备份的意义，在于永远用不上。', '运维哲学'],
    ['模型会过时，数据资产不会。', 'AI 工作台'],
    ['今天也要把数据一致性做到 99.8%。', '丰年']
  ];

  /* ---------- 数据：每日一签 ---------- */
  const LUCKS = [
    ['大吉', '宜上线、宜重构、宜跑全量。今天写什么都一次过。'],
    ['中吉', '稳步推进即可。适合处理积压的慢查询。'],
    ['小吉', '小事顺遂。适合整理文档与口径表。'],
    ['吉', '平常心。备份做完再动手，万无一失。'],
    ['半吉', '上午摸鱼，下午发力。晚间灵感更佳。'],
    ['末吉', '宜学习不宜上线。读一篇论文正好。'],
    ['平', '无凶即是吉。适合复盘和对账。']
  ];
  const YI = ['上线', '重构', '备份', '复盘', '读文档', '写 SQL', '画图', '早睡', '加索引', '对账'];
  const JI = ['改生产', '删表', '裸奔上线', '跳过测试', '口头口径', '深夜发布'];

  /* ---------- 建站日期（用于“已运行天数”） ---------- */
  const SITE_BIRTH = new Date(2026, 0, 1); // 2026-01-01 起算

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function widget(title, cls) {
    const w = el('div', 'widget ' + cls);
    const h = el('div', 'widget-head');
    h.appendChild(el('span', null, title));
    h.appendChild(el('span', 'w-dot'));
    w.appendChild(h);
    return w;
  }

  /* ---------- 1. 日历（含小时钟） ---------- */
  function buildCalendar() {
    const w = widget('今日日历', 'widget-cal');
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth(), today = now.getDate();

    const top = el('div', 'cal-top');
    top.appendChild(el('span', 'cal-ym', y + ' 年 ' + (m + 1) + ' 月'));
    const clock = el('span', 'cal-clock', '--:--');
    top.appendChild(clock);
    w.appendChild(top);

    const grid = el('div', 'cal-grid');
    ['一', '二', '三', '四', '五', '六', '日'].forEach(function (d) {
      grid.appendChild(el('span', 'cal-cell cal-wd', d));
    });
    const firstDay = (new Date(y, m, 1).getDay() + 6) % 7; // 周一开头
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) grid.appendChild(el('span', 'cal-cell cal-pad', ''));
    for (let d = 1; d <= daysInMonth; d++) {
      const c = el('span', 'cal-cell' + (d === today ? ' cal-today' : ''), String(d));
      grid.appendChild(c);
    }
    w.appendChild(grid);

    w.appendChild(el('div', 'cal-foot', (m + 1) + '月' + today + '日 · ' + WEEK[now.getDay()]));

    function tick() {
      const n = new Date();
      clock.textContent = String(n.getHours()).padStart(2, '0') + ':' +
        String(n.getMinutes()).padStart(2, '0');
    }
    tick();
    setInterval(tick, 10000);
    return w;
  }

  /* ---------- 2. 每日一言 ---------- */
  function buildQuote() {
    const w = widget('每日一言', 'widget-quote');
    const q = QUOTES[dailyIndex(QUOTES.length)];
    w.appendChild(el('div', 'quote-text', '「' + q[0] + '」'));
    w.appendChild(el('div', 'quote-from', '—— ' + q[1]));
    return w;
  }

  /* ---------- 3. 每日一签 ---------- */
  function buildLuck() {
    const w = widget('每日一签', 'widget-luck');
    const l = LUCKS[dailyIndex(LUCKS.length, 7)];
    w.appendChild(el('div', 'luck-result', l[0]));
    w.appendChild(el('div', 'luck-comment', l[1]));
    const yi = el('div', 'luck-row');
    yi.appendChild(el('span', 'luck-tag luck-tag--yi', '宜'));
    yi.appendChild(el('span', null, YI[dailyIndex(YI.length, 3)] + ' · ' + YI[dailyIndex(YI.length, 11)]));
    const ji = el('div', 'luck-row');
    ji.appendChild(el('span', 'luck-tag luck-tag--ji', '忌'));
    ji.appendChild(el('span', null, JI[dailyIndex(JI.length, 5)]));
    w.appendChild(yi); w.appendChild(ji);
    return w;
  }

  /* ---------- 4. 背景音乐（Web Audio 合成，4 首循环曲） ---------- */
  // 音高用 MIDI 数字；每轨 = [音, 拍数]，鼓点用 0 表示休止
  const TRACKS = [
    { name: '深夜机房', bpm: 84, wave: 'triangle',
      seq: [[57,1],[60,1],[64,1],[60,1],[65,2],[64,1],[60,1],[62,2],[57,1],[60,1],[64,2],[69,1],[67,2],[64,2]] },
    { name: '数据流', bpm: 96, wave: 'square',
      seq: [[69,.5],[72,.5],[76,.5],[72,.5],[69,.5],[72,.5],[76,.5],[79,.5],[77,1],[76,1],[72,1],[74,2],[69,2]] },
    { name: '星轨', bpm: 72, wave: 'sine',
      seq: [[64,2],[67,2],[71,2],[69,2],[72,3],[71,1],[67,2],[64,2],[62,4]] },
    { name: '便利店夜曲', bpm: 88, wave: 'triangle',
      seq: [[60,1],[64,1],[67,1],[72,1],[67,1],[64,1],[65,1],[69,1],[72,1],[69,1],[65,1],[64,2],[62,2]] }
  ];

  function buildMusic() {
    const w = widget('背景音乐', 'widget-music');
    const name = el('div', 'music-name', TRACKS[0].name);
    const row = el('div', 'music-controls');
    const playBtn = el('button', 'music-btn', '▶');
    playBtn.title = '播放/暂停';
    const nextBtn = el('button', 'music-btn', '⏭');
    nextBtn.title = '换一首';
    const state = el('span', 'music-state', '已暂停');
    row.appendChild(playBtn); row.appendChild(nextBtn); row.appendChild(state);
    w.appendChild(name); w.appendChild(row);

    let ctx = null, timer = null, nextTime = 0, idx = 0, trackIdx = 0, playing = false;

    function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
    function beatSec() { return 60 / TRACKS[trackIdx].bpm; }

    function schedule() {
      const t = TRACKS[trackIdx];
      while (nextTime < ctx.currentTime + 0.35) {
        const [note, beats] = t.seq[idx];
        const dur = beats * beatSec();
        if (note > 0) {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = t.wave;
          osc.frequency.value = midi(note);
          g.gain.setValueAtTime(0, nextTime);
          g.gain.linearRampToValueAtTime(0.14, nextTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, nextTime + dur * 0.92);
          osc.connect(g).connect(ctx.destination);
          osc.start(nextTime);
          osc.stop(nextTime + dur);
        }
        nextTime += dur;
        idx = (idx + 1) % t.seq.length;
      }
    }
    function start() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      idx = 0; nextTime = ctx.currentTime + 0.06;
      timer = setInterval(schedule, 120);
      playing = true;
      playBtn.textContent = '⏸';
      state.textContent = '播放中';
      name.classList.add('is-playing');
    }
    function stop() {
      clearInterval(timer); timer = null;
      playing = false;
      playBtn.textContent = '▶';
      state.textContent = '已暂停';
      name.classList.remove('is-playing');
    }
    playBtn.addEventListener('click', function () { playing ? stop() : start(); });
    nextBtn.addEventListener('click', function () {
      trackIdx = (trackIdx + 1) % TRACKS.length;
      name.textContent = TRACKS[trackIdx].name;
      if (playing) { stop(); start(); }
    });
    return w;
  }


  const TODO_KEY = 'side-widget-todos';
  function loadTodos() {
    try { return JSON.parse(localStorage.getItem(TODO_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveTodos(list) { localStorage.setItem(TODO_KEY, JSON.stringify(list)); }

  function buildTodo() {
    const w = widget('迷你待办', 'widget-todo');
    const row = el('div', 'todo-input-row');
    const input = document.createElement('input');
    input.placeholder = '加一条待办…';
    input.maxLength = 30;
    const add = el('button', 'todo-add', '+');
    row.appendChild(input); row.appendChild(add);
    const list = document.createElement('ul');
    w.appendChild(row); w.appendChild(list);

    let todos = loadTodos();

    function render() {
      list.innerHTML = '';
      if (!todos.length) {
        list.appendChild(el('li', 'todo-empty', '暂无待办，轻松的一天'));
        return;
      }
      todos.forEach(function (item, i) {
        const li = document.createElement('li');
        if (item.done) li.className = 'done';
        const check = el('button', 'todo-check', '✓');
        check.title = '完成/取消';
        check.addEventListener('click', function () {
          todos[i].done = !todos[i].done; saveTodos(todos); render();
        });
        const text = el('span', 'todo-text', item.text);
        const del = el('button', 'todo-del', '×');
        del.title = '删除';
        del.addEventListener('click', function () {
          todos.splice(i, 1); saveTodos(todos); render();
        });
        li.appendChild(check); li.appendChild(text); li.appendChild(del);
        list.appendChild(li);
      });
    }
    function addTodo() {
      const v = input.value.trim();
      if (!v) return;
      todos.push({ text: v, done: false });
      saveTodos(todos); input.value = ''; render();
    }
    add.addEventListener('click', addTodo);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') addTodo(); });
    render();
    return w;
  }

  /* ---------- 5. 站点统计 + 倒计时 ---------- */
  function buildStats() {
    const w = widget('站点状态', 'widget-stats');
    const now = new Date();
    const days = Math.floor((now - SITE_BIRTH) / 86400000);
    const nextYear = new Date(now.getFullYear() + 1, 0, 1);
    const left = Math.ceil((nextYear - now) / 86400000);

    const rows = [
      ['本站已运行', days + ' 天'],
      ['距 ' + nextYear.getFullYear() + ' 年', left + ' 天'],
      ['今日运程', LUCKS[dailyIndex(LUCKS.length, 7)][0]]
    ];
    rows.forEach(function (r) {
      const row = el('div', 'stat-row');
      row.appendChild(el('span', 'stat-label', r[0]));
      row.appendChild(el('span', 'stat-value', r[1]));
      w.appendChild(row);
    });
    return w;
  }

  /* ---------- 5. 贡献热力图（本地生成，按周稳定） ---------- */
  function buildHeatmap() {
    const w = widget('提交热力', 'widget-heat');
    const grid = el('div', 'heat-grid');
    const now = new Date();
    const cols = 20; // 近 20 周
    const seedBase = now.getFullYear() * 100 + Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 604800000);
    let total = 0;
    for (let c = 0; c < cols * 7; c++) {
      const cell = el('span', 'heat-cell');
      // 伪随机：种子按周+格子位置，保证同一天渲染稳定
      const v = Math.abs(Math.sin(seedBase * 7 + c * 13.37) * 10000) % 1;
      const lv = v < 0.3 ? 0 : v < 0.55 ? 1 : v < 0.75 ? 2 : v < 0.9 ? 3 : 4;
      cell.className = 'heat-cell heat-lv' + lv;
      total += lv * 2;
      grid.appendChild(cell);
    }
    w.appendChild(grid);
    w.appendChild(el('div', 'heat-foot', '近 20 周共 ' + total + ' 次提交'));
    return w;
  }

  /* ---------- 6. 最近足迹（localStorage） ---------- */
  const FOOT_KEY = 'side-widget-footprints';
  function buildFootprints() {
    const w = widget('最近足迹', 'widget-foot');
    let list = [];
    try { list = JSON.parse(localStorage.getItem(FOOT_KEY)) || []; } catch (e) {}
    const title = document.title.split('·')[0].split('|')[0].trim() || document.title;
    const url = location.pathname.split('/').pop() || 'index.html';
    list = list.filter(function (x) { return x.url !== url; });
    list.unshift({ title: title, url: url });
    list = list.slice(0, 5);
    localStorage.setItem(FOOT_KEY, JSON.stringify(list));

    const ul = el('ul', 'foot-list');
    list.forEach(function (x, i) {
      const li = document.createElement('li');
      if (i === 0) li.className = 'is-current';
      const a = document.createElement('a');
      a.href = x.url;
      a.textContent = x.title;
      li.appendChild(a);
      ul.appendChild(li);
    });
    w.appendChild(ul);
    return w;
  }

  /* ---------- 7. 阅读进度条 + 回到顶部（全局） ---------- */
  function mountProgress() {
    const bar = el('div', 'read-progress');
    document.body.appendChild(bar);
    const btn = el('button', 'back-top', '↑');
    btn.title = '回到顶部';
    btn.setAttribute('aria-label', '回到顶部');
    document.body.appendChild(btn);
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    function onScroll() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? (h.scrollTop / max) : 0;
      bar.style.transform = 'scaleX(' + p + ')';
      btn.classList.toggle('is-show', h.scrollTop > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 8. 鼠标粒子拖尾（低浓度，暗紫） ---------- */
  function mountParticles() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window) return; // 触屏无意义
    const cv = document.createElement('canvas');
    cv.className = 'cursor-particles';
    document.body.appendChild(cv);
    const g = cv.getContext('2d');
    let dots = [];
    function resize() { cv.width = innerWidth; cv.height = innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    let last = 0;
    window.addEventListener('mousemove', function (e) {
      const now = performance.now();
      if (now - last < 28) return; // 节流
      last = now;
      dots.push({ x: e.clientX, y: e.clientY, r: 2 + Math.random() * 2, life: 1 });
      if (dots.length > 60) dots.shift();
    });
    (function draw() {
      g.clearRect(0, 0, cv.width, cv.height);
      dots = dots.filter(function (d) { return d.life > 0; });
      dots.forEach(function (d) {
        d.life -= 0.025;
        d.y -= 0.3;
        g.beginPath();
        g.arc(d.x, d.y, d.r * d.life, 0, 6.283);
        g.fillStyle = 'rgba(143,154,230,' + (0.35 * d.life).toFixed(3) + ')';
        g.fill();
      });
      requestAnimationFrame(draw);
    })();
  }


  function mount() {
    if (document.querySelector('.side-rail')) return;
    const left = el('aside', 'side-rail side-rail--left');
    left.setAttribute('aria-label', '日常小组件');
    left.appendChild(buildQuote());
    left.appendChild(buildMusic());
    left.appendChild(buildCalendar());
    left.appendChild(buildHeatmap());

    const right = el('aside', 'side-rail side-rail--right');
    right.setAttribute('aria-label', '日常小组件');
    right.appendChild(buildLuck());
    right.appendChild(buildTodo());
    right.appendChild(buildFootprints());
    right.appendChild(buildStats());

    document.body.appendChild(left);
    document.body.appendChild(right);

    mountProgress();
    mountParticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
