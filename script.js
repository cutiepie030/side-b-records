/* ============================================================
   SIDE B · 心事唱片行  —  script.js
   全部逻辑：情绪生成 / 封面编辑 / 贴纸拖拽 / Web Audio 原创旋律 / PNG 导出
   无外部依赖，可直接部署到任意静态托管。
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 工具 ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  /* ============================================================
     情绪配置：词库 / 模板 / 音乐
     ============================================================ */
  const EMOTIONS = {
    心动: {
      fallbackKw: "心动",
      titleTpl: [
        "关于{kw}的第{pad}次心动",
        "{kw}练习曲",
        "怦然 · {kw}",
        "把{kw}写进副歌",
        "脸红时刻",
        "星河里的{kw}",
      ],
      trackPlain: ["前奏：靠近", "副歌：脸红", "间奏：私语", "未寄出的告白", "心跳节拍器", "晨光里的巧合"],
      trackKw: ["{kw}的前奏", "{kw}的副歌", "写给{kw}的歌", "在{kw}里怦然"],
      msgTpl: [
        "有些心动不必说出口，黑胶会替你记得。",
        "愿这一面唱片，收留你所有没说出口的喜欢。",
        "今天的心跳频率，刚刚好是喜欢的形状。",
      ],
      artists: ["SIDE B RECORDS", "午夜电台", "奶油唱片", "怦然小组"],
      music: {
        bpm: 96,
        progression: [
          ["F3", "A3", "C4", "E4"],
          ["G3", "B3", "D4", "F4"],
          ["E3", "G3", "B3", "D4"],
          ["A3", "C4", "E4", "G4"],
        ],
        melody: ["A4", null, "C5", "E5", "D5", null, "C5", "A4", "B4", null, "D5", "F5", "E5", null, "D5", "C5"],
        drums: ["k", "h", null, "h", "s", "h", null, "h"],
      },
    },
    想念: {
      fallbackKw: "你",
      titleTpl: [
        "{kw}的回信",
        "在{kw}里想你",
        "寄给{kw}的晚安",
        "月光邮差",
        "未接来电",
        "旧信与{kw}",
      ],
      trackPlain: ["未接来电", "月亮邮差", "雨后的回声", "信箱里的安静", "晚风留言", "远方的站台"],
      trackKw: ["{kw}的回声", "寄给{kw}的歌", "在{kw}里想你", "{kw}的晚安"],
      msgTpl: [
        "想念是一种没有收件人的邮寄，SIDE B 替你盖章。",
        "把想说的话刻进纹路，让唱针替你循环。",
        "今晚的月亮，替我寄到你那里去。",
      ],
      artists: ["SIDE B RECORDS", "远方电台", "信箱计划", "晚风工作室"],
      music: {
        bpm: 72,
        progression: [
          ["A2", "C3", "E3", "G3"],
          ["D3", "F3", "A3", "C4"],
          ["E3", "G3", "B3", "D4"],
          ["A2", "E3", "A3", "C4"],
        ],
        melody: ["E4", null, null, "A4", "G4", null, "E4", null, "F4", null, null, "D4", "E4", null, null, null],
        drums: ["k", null, null, "h", null, null, "s", "h"],
      },
    },
    自由: {
      fallbackKw: "远方",
      titleTpl: [
        "{kw}说明书",
        "去{kw}的路上",
        "无人之境的歌",
        "把{kw}调大音量",
        "公路与{kw}",
        "风的形状",
      ],
      trackPlain: ["出发不必理由", "风的形状", "赤脚奔跑", "候鸟时刻", "海与地平线", "无人之境"],
      trackKw: ["{kw}与自由", "去{kw}的路上", "写给{kw}的歌", "在{kw}里流浪"],
      msgTpl: [
        "自由不是去哪里，是终于敢把耳机音量调大。",
        "这一面，献给所有说走就走的下午。",
        "风会记得，你曾认真地不回头。",
      ],
      artists: ["SIDE B RECORDS", "旷野电台", "公路唱片", "候鸟联盟"],
      music: {
        bpm: 104,
        progression: [
          ["C3", "G3", "C4", "E4"],
          ["G2", "D3", "G3", "B3"],
          ["A2", "E3", "A3", "C4"],
          ["F2", "C3", "F3", "A3"],
        ],
        melody: ["C5", null, "E5", "G5", "E5", null, "C5", "A4", "F5", null, "A5", "G5", "E5", null, "D5", "C5"],
        drums: ["k", "h", "k", "h", "s", "h", "k", "h"],
      },
    },
    遗憾: {
      fallbackKw: "如果",
      titleTpl: [
        "{kw}的独白",
        "如果{kw}重来",
        "写给{kw}的迟到的信",
        "差一步的夏天",
        "散场之后",
        "未完待续",
      ],
      trackPlain: ["差一步的夏天", "沉默的副歌", "雨停以后", "退场的灯", "空白的那页", "擦肩的回声"],
      trackKw: ["{kw}的独白", "写给{kw}的信", "如果{kw}重来", "{kw}与遗憾"],
      msgTpl: [
        "遗憾也是唱片的一部分，翻到 SIDE B 才懂它的好。",
        "有些歌没唱完，但谢谢你曾认真听过。",
        "散场之后，灯光替我们说完没说的话。",
      ],
      artists: ["SIDE B RECORDS", "旧票根", "散场电台", "迟到工作室"],
      music: {
        bpm: 78,
        progression: [
          ["D3", "F3", "A3", "C4"],
          ["G2", "D3", "G3", "B3"],
          ["C3", "G3", "C4", "E4"],
          ["B2", "F3", "A3", "D4"],
        ],
        melody: ["F4", null, "A4", null, "G4", null, "E4", null, "D4", null, "F4", null, "E4", null, null, null],
        drums: ["k", null, null, "h", null, "s", null, "h"],
      },
    },
  };

  const STICKERS = ["🌙", "⭐", "💌", "🎀", "🍂", "🌿", "☁️", "🪐", "🎧", "🌸", "🕯️", "✉️", "🧷", "🍃", "🌊", "🫧", "🪷", "💫"];

  /* ---------- 关键词提取（轻量主题词典，避免生硬拼字） ---------- */
  const STOP_CHAR = /[的了着我你他她它是想和与就也都又把被让给对过吗呢吧啊呀哦嗯要会能个一二两三四五]/g;
  // 主题词典：[触发词, 诗意关键词]，按优先级排列（越具体越靠前）
  const THEMES = [
    [["背影"], "背影"],
    [["地铁", "车站", "站台", "车厢", "列车", "火车"], "站台"],
    [["月亮", "月光", "月色", "今晚的月"], "月亮"],
    [["星", "银河", "宇宙", "夜空"], "星河"],
    [["晚风", "夜风", "风里"], "晚风"],
    [["海边", "大海", "浪", "潮", "沙滩"], "潮汐"],
    [["雨", "雨天", "下雨"], "雨季"],
    [["雪", "下雪"], "初雪"],
    [["咖啡"], "咖啡馆"],
    [["猫"], "那只猫"],
    [["花", "玫瑰", "樱花"], "花期"],
    [["盛夏", "夏天", "蝉"], "盛夏"],
    [["冬", "寒", "冷"], "冬夜"],
    [["春", "樱花树"], "春天"],
    [["秋", "落叶", "枫", "银杏"], "秋日"],
    [["毕业", "校园", "教室", "同桌", "青春"], "青春"],
    [["加班", "上班", "工作", "通勤"], "加班夜"],
    [["朋友", "兄弟", "闺蜜"], "老朋友"],
    [["家", "回家", "故乡", "爸妈", "妈妈", "爸爸"], "回家的路"],
    [["旅行", "出发", "远方", "路上", "流浪"], "远方"],
    [["清晨", "早晨", "天亮", "日出", "早安"], "清晨"],
    [["黄昏", "日落", "傍晚", "夕阳"], "黄昏"],
    [["酒", "醉", "微醺"], "微醺"],
    [["梦", "梦里"], "梦"],
    [["灯", "路灯", "灯光"], "灯光"],
    [["烟"], "烟"],
    [["孤单", "一个人", "寂寞"], "一个人"],
    [["长大", "成长"], "长大"],
    [["错过", "如果", "重来"], "如果"],
    [["自由", "逃跑", "逃离"], "自由"],
    [["想你", "想念", "思念"], "想念"],
    [["风"], "风的形状"],
    [["爱", "喜欢", "心动"], "喜欢"],
    [["你"], "你"],
  ];
  function extractKeyword(text) {
    if (!text) return "";
    const cleaned = text.replace(/[，。！？、；：""''…\s\n\r\t,.;:!?()（）【】\[\]《》<>—_\-~]/g, "");
    if (!cleaned) return "";
    // 短句直接使用（去掉装饰性的首尾虚词）
    if (cleaned.length >= 2 && cleaned.length <= 8) {
      const k = cleaned.replace(STOP_CHAR, "");
      return k.length >= 2 ? k : cleaned;
    }
    // 长句：命中主题词典
    for (const [keys, kw] of THEMES) {
      if (keys.some((k) => text.includes(k))) return kw;
    }
    // 兜底：去掉虚词后取一段
    const k2 = cleaned.replace(STOP_CHAR, "");
    if (k2.length >= 2 && k2.length <= 6) return k2;
    return "";
  }

  /* ============================================================
     状态
     ============================================================ */
  const state = {
    emotion: null,
    userText: "",
    album: { title: "", artist: "", tracks: ["", "", ""], message: "", template: "cream", emotion: "心动" },
    stickers: [], // {emoji, x(0-1), y(0-1), size(0-1)}
  };

  /* ============================================================
     生成
     ============================================================ */
  function generate(useNewEmotion) {
    const emo = state.emotion || pick(Object.keys(EMOTIONS));
    state.emotion = emo;
    const cfg = EMOTIONS[emo];
    const kw = extractKeyword(state.userText) || cfg.fallbackKw;

    // 标题
    let title = pick(cfg.titleTpl);
    title = title.replace("{kw}", kw);
    if (title.includes("{pad}")) {
      const n = String(randInt(1, 99)).padStart(2, "0");
      title = title.replace("{pad}", n);
    }
    // 三首曲目（尽量不重复）
    const pool = kw === cfg.fallbackKw ? cfg.trackPlain.slice() : cfg.trackPlain.concat(cfg.trackKw);
    const tracks = [];
    const used = new Set();
    let guard = 0;
    while (tracks.length < 3 && guard++ < 40) {
      let t = pick(pool).replace("{kw}", kw);
      if (used.has(t) || t === title) continue; // 避免曲目与专辑名重复
      used.add(t);
      tracks.push(t);
    }
    while (tracks.length < 3) tracks.push(pick(cfg.trackPlain));
    // 曲目编号前缀清理（避免“01 前奏：靠近”过长时仍可读）
    const message = pick(cfg.msgTpl).replace("{kw}", kw);
    const artist = pick(cfg.artists);

    state.album = {
      title, artist, tracks,
      message,
      template: state.album.template || "cream",
      emotion: emo,
    };
    renderCover();
  }

  /* ============================================================
     渲染封面（DOM）
     ============================================================ */
  const cover = $("#cover");
  const cTitle = $("#cTitle");
  const cArtist = $("#cArtist");
  const cTracks = $("#cTracks");
  const cMessage = $("#cMessage");
  const cEmoTag = $("#cEmoTag");

  function renderCover() {
    const a = state.album;
    cover.className = `cover tpl-${a.template} emo-${a.emotion}`;
    cTitle.textContent = a.title;
    cArtist.textContent = a.artist;
    cMessage.textContent = a.message;
    cEmoTag.textContent = a.emotion;
    cTracks.innerHTML = "";
    a.tracks.forEach((t, i) => {
      const row = document.createElement("div");
      row.className = "c-track";
      const num = document.createElement("span");
      num.className = "num";
      num.textContent = String(i + 1).padStart(2, "0");
      const txt = document.createElement("span");
      txt.className = "txt";
      txt.contentEditable = "true";
      txt.spellcheck = false;
      txt.textContent = t;
      txt.addEventListener("input", () => {
        a.tracks[i] = txt.textContent;
      });
      row.appendChild(num);
      row.appendChild(txt);
      cTracks.appendChild(row);
    });
    renderStickers();
  }

  function escapeHtml(s) {
    return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }

  /* ============================================================
     贴纸：添加 / 渲染 / 拖拽 / 删除
     ============================================================ */
  const stickerLayer = $("#stickerLayer");

  function addSticker(emoji, x, y) {
    const s = {
      emoji,
      x: x == null ? 0.18 + Math.random() * 0.5 : x,
      y: y == null ? 0.2 + Math.random() * 0.5 : y,
      size: 0.12,
    };
    state.stickers.push(s);
    renderStickers();
  }

  function renderStickers() {
    stickerLayer.innerHTML = "";
    state.stickers.forEach((s, idx) => {
      const el = document.createElement("div");
      el.className = "sticker";
      el.textContent = s.emoji;
      el.style.left = s.x * 100 + "%";
      el.style.top = s.y * 100 + "%";
      el.style.fontSize = s.size * 100 + "cqw";
      attachDrag(el, s, idx);
      stickerLayer.appendChild(el);
    });
  }

  function attachDrag(el, s, idx) {
    let dragging = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
    const onDown = (e) => {
      dragging = true; moved = false;
      const p = e.touches ? e.touches[0] : e;
      sx = p.clientX; sy = p.clientY;
      const r = cover.getBoundingClientRect();
      ox = s.x; oy = s.y;
      el.setPointerCapture && e.pointerId != null && el.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const r = cover.getBoundingClientRect();
      const dx = (p.clientX - sx) / r.width;
      const dy = (p.clientY - sy) / r.height;
      if (Math.abs(p.clientX - sx) > 3 || Math.abs(p.clientY - sy) > 3) moved = true;
      s.x = Math.min(1, Math.max(0, ox + dx));
      s.y = Math.min(1, Math.max(0, oy + dy));
      el.style.left = s.x * 100 + "%";
      el.style.top = s.y * 100 + "%";
      e.preventDefault();
    };
    const onUp = (e) => {
      dragging = false;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    // 双击删除
    el.addEventListener("dblclick", (e) => {
      e.preventDefault();
      state.stickers.splice(idx, 1);
      renderStickers();
    });
  }

  /* ============================================================
     Web Audio 原创旋律引擎
     ============================================================ */
  const Audio = (function () {
    let ctx = null, master = null, delay = null, fb = null, noiseBuf = null;
    let timer = null, playing = false, cfg = null;
    let step = 0, nextTime = 0;
    const SPU = 2; // steps per beat (8th notes)
    const BPC = 4; // beats per chord
    const LOOK = 0.12;

    const SEMI = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
    function freq(n) {
      const m = n.match(/^([A-G]#?)(\d)$/);
      const midi = SEMI[m[1]] + (parseInt(m[2], 10) + 1) * 12;
      return 440 * Math.pow(2, (midi - 69) / 12);
    }

    function init() {
      if (ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.0001;
      delay = ctx.createDelay(1.0); delay.delayTime.value = 0.34;
      fb = ctx.createGain(); fb.gain.value = 0.22;
      delay.connect(fb); fb.connect(delay); delay.connect(master);
      master.connect(ctx.destination);
      // 噪声缓冲（鼓）
      const len = ctx.sampleRate * 0.5;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }

    function note(time, f, dur, type, peak, useDelay) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.value = f;
      const atk = Math.min(0.04, dur * 0.3);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(peak, time + atk);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      o.connect(g); g.connect(useDelay ? delay : master);
      o.start(time); o.stop(time + dur + 0.05);
    }

    function kick(time) {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(140, time);
      o.frequency.exponentialRampToValueAtTime(45, time + 0.12);
      g.gain.setValueAtTime(0.5, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
      o.connect(g); g.connect(master); o.start(time); o.stop(time + 0.2);
    }
    function hat(time, open) {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7000;
      const g = ctx.createGain();
      const dur = open ? 0.12 : 0.04;
      g.gain.setValueAtTime(0.12, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      s.connect(hp); hp.connect(g); g.connect(master);
      s.start(time); s.stop(time + dur + 0.02);
    }
    function snare(time) {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.18, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
      s.connect(bp); bp.connect(g); g.connect(master);
      s.start(time); s.stop(time + 0.16);
    }

    function scheduleStep(stp, time) {
      const beatDur = 60 / cfg.bpm;
      const stepDur = beatDur / SPU;
      const chordIdx = Math.floor((stp % (cfg.progression.length * BPC * SPU)) / (BPC * SPU));
      const within = stp % (BPC * SPU);
      const chord = cfg.progression[chordIdx];

      if (within === 0) {
        // 铺底和弦（柔 pad）
        chord.forEach((n) => note(time, freq(n), beatDur * BPC * 0.98, "sine", 0.05, false));
        // 低音根音
        note(time, freq(chord[0]) / 2, beatDur * 1.6, "triangle", 0.16, false);
      }
      if (within === Math.floor(BPC * SPU / 2)) {
        // 和弦中点：低音五度
        note(time, freq(chord[0]) / 2 * 1.5, beatDur * 1.2, "triangle", 0.12, false);
      }
      // 旋律
      const mel = cfg.melody;
      const mn = mel[stp % mel.length];
      if (mn) note(time, freq(mn), stepDur * 1.6, "triangle", 0.13, true);
      // 鼓
      const dp = cfg.drums;
      const dn = dp[stp % dp.length];
      if (dn === "k") kick(time);
      else if (dn === "h") hat(time, false);
      else if (dn === "s") snare(time);
    }

    function scheduler() {
      const beatDur = 60 / cfg.bpm;
      const stepDur = beatDur / SPU;
      while (nextTime < ctx.currentTime + LOOK) {
        scheduleStep(step, nextTime);
        nextTime += stepDur;
        step++;
      }
    }

    function play(emotion) {
      init();
      if (ctx.state === "suspended") ctx.resume();
      cfg = EMOTIONS[emotion].music;
      step = 0;
      nextTime = ctx.currentTime + 0.08;
      if (!playing) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), ctx.currentTime);
        master.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.4);
      }
      playing = true;
      if (timer) clearInterval(timer);
      timer = setInterval(scheduler, 25);
    }
    function stop() {
      if (!ctx) return;
      playing = false;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      if (timer) { clearInterval(timer); timer = null; }
    }
    return {
      play, stop,
      get playing() { return playing; },
      isReady() { return !!ctx; },
    };
  })();

  /* ============================================================
     PNG 导出（手写 canvas，无第三方库）
     ============================================================ */
  function wrapText(ctx, text, x, y, maxW, lh) {
    const chars = Array.from(text);
    let line = "", yy = y;
    for (const ch of chars) {
      if (ctx.measureText(line + ch).width > maxW && line) {
        ctx.fillText(line, x, yy); line = ch; yy += lh;
      } else line += ch;
    }
    if (line) ctx.fillText(line, x, yy);
    return yy + lh;
  }

  function exportPNG() {
    const S = 1080;
    const cv = document.createElement("canvas");
    cv.width = S; cv.height = S;
    const ctx = cv.getContext("2d");
    const a = state.album;
    const emo = a.emotion;
    const accent = { "心动": "#e8738c", "想念": "#6e8fb0", "自由": "#e0a85b", "遗憾": "#a9796b" }[emo];

    // 背景
    if (a.template === "cream") {
      const g = ctx.createLinearGradient(0, 0, S, S);
      g.addColorStop(0, "#fbf6ef"); g.addColorStop(1, "#f3e7da");
      ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
      const rg = ctx.createRadialGradient(S * 0.82, S * 0.14, 0, S * 0.82, S * 0.14, 320);
      rg.addColorStop(0, "rgba(232,180,192,.35)"); rg.addColorStop(1, "transparent");
      ctx.fillStyle = rg; ctx.fillRect(0, 0, S, S);
    } else if (a.template === "midnight") {
      const g = ctx.createRadialGradient(S * 0.7, S * 0.2, 0, S * 0.7, S * 0.2, S);
      g.addColorStop(0, "#3a262c"); g.addColorStop(1, "#211518");
      ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
      const rg = ctx.createRadialGradient(S * 0.76, S * 0.3, 0, S * 0.76, S * 0.3, 360);
      rg.addColorStop(0, "rgba(201,164,91,.22)"); rg.addColorStop(1, "transparent");
      ctx.fillStyle = rg; ctx.fillRect(0, 0, S, S);
    } else { // journal
      ctx.fillStyle = "#f4ecdb"; ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = "rgba(120,90,60,.18)"; ctx.lineWidth = 3;
      ctx.strokeRect(8, 8, S - 16, S - 16);
      ctx.strokeStyle = "rgba(120,90,60,.07)"; ctx.lineWidth = 1;
      for (let y = 40; y < S; y += 40) { ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(S - 20, y); ctx.stroke(); }
      // 胶带
      ctx.save(); ctx.translate(S * 0.2, 18); ctx.rotate(-0.09);
      ctx.fillStyle = "rgba(217,199,163,.75)"; ctx.fillRect(-70, -18, 220, 40);
      ctx.restore();
    }

    const ink = a.template === "midnight" ? "#f4e9dd" : (a.template === "journal" ? "#4a4034" : "#3a3330");

    // 文字区宽度（左侧 48%）
    const L = 72, W = S * 0.48;

    // wordmark
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = ink;
    ctx.font = '700 56px "Playfair Display", serif';
    ctx.fillText("SIDE B", L, 92);
    ctx.fillStyle = a.template === "midnight" ? "rgba(244,233,221,.6)" : "rgba(58,51,48,.55)";
    ctx.font = '500 30px "Caveat", cursive';
    ctx.fillText("a record for your feelings.", L, 126);

    // 情绪标签
    ctx.font = '600 30px "Noto Serif SC", serif';
    const tagW = ctx.measureText(emo).width + 44;
    const tagX = S - L - tagW, tagY = 64;
    if (a.template === "journal") {
      ctx.strokeStyle = accent; ctx.lineWidth = 3;
      ctx.strokeRoundRect ? ctx.strokeRoundRect(tagX, tagY, tagW, 48, 24) : ctx.strokeRect(tagX, tagY, tagW, 48);
      ctx.fillStyle = accent; ctx.textAlign = "center";
      ctx.fillText(emo, tagX + tagW / 2, tagY + 34);
    } else {
      ctx.fillStyle = accent;
      if (ctx.roundRect) ctx.beginPath(), ctx.roundRect(tagX, tagY, tagW, 48, 24), ctx.fill();
      else ctx.fillRect(tagX, tagY, tagW, 48);
      ctx.fillStyle = "#fff"; ctx.textAlign = "center";
      ctx.fillText(emo, tagX + tagW / 2, tagY + 34);
    }
    ctx.textAlign = "left";

    // 标题
    ctx.fillStyle = ink;
    const titleFont = a.template === "journal" ? '400 92px "Long Cang", cursive' : '700 86px "Noto Serif SC", serif';
    ctx.font = titleFont;
    let ty = 250;
    ty = wrapText(ctx, a.title, L, ty, W, a.template === "journal" ? 96 : 104);

    // 艺术家
    ctx.fillStyle = a.template === "midnight" ? "rgba(244,233,221,.6)" : "rgba(58,51,48,.6)";
    ctx.font = 'italic 500 30px "Playfair Display", serif';
    ctx.fillText(a.artist, L, ty + 8);

    // 曲目
    let ry = ty + 80;
    ctx.font = '400 40px "Noto Serif SC", serif';
    a.tracks.forEach((t, i) => {
      ctx.fillStyle = a.template === "midnight" ? "rgba(244,233,221,.5)" : "rgba(58,51,48,.5)";
      ctx.font = '500 30px "Playfair Display", serif';
      ctx.fillText(String(i + 1).padStart(2, "0"), L, ry);
      ctx.fillStyle = ink;
      ctx.font = '400 40px "Noto Serif SC", serif';
      ctx.fillText(t, L + 70, ry);
      ry += 56;
    });

    // 寄语
    ctx.fillStyle = ink;
    const mFont = a.template === "journal" ? '400 52px "Long Cang", cursive' : '400 38px "Long Cang", cursive';
    ctx.font = mFont;
    wrapText(ctx, a.message, L, S - 150, W, 56);

    // 黑胶（右侧）
    const vx = S * 0.75, vy = S * 0.5, vr = S * 0.19;
    const vg = ctx.createRadialGradient(vx, vy, 0, vx, vy, vr);
    vg.addColorStop(0, "#2a1f23"); vg.addColorStop(1, "#160f12");
    ctx.fillStyle = vg; ctx.beginPath(); ctx.arc(vx, vy, vr, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.06)"; ctx.lineWidth = 1.5;
    for (let r = vr * 0.3; r < vr; r += 7) { ctx.beginPath(); ctx.arc(vx, vy, r, 0, Math.PI * 2); ctx.stroke(); }
    // 中心标
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(vx, vy, vr * 0.32, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.beginPath(); ctx.arc(vx, vy, vr * 0.06, 0, Math.PI * 2); ctx.fill();
    // 播放三角
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(vx - vr * 0.1, vy - vr * 0.13);
    ctx.lineTo(vx - vr * 0.1, vy + vr * 0.13);
    ctx.lineTo(vx + vr * 0.13, vy);
    ctx.closePath(); ctx.fill();

    // 贴纸
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    state.stickers.forEach((s) => {
      ctx.font = `${Math.round(s.size * S)}px "Apple Color Emoji","Segoe UI Emoji",serif`;
      ctx.fillText(s.emoji, s.x * S, s.y * S);
    });
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";

    // 下载
    cv.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safe = (a.title || "SIDE-B").replace(/[\\/:*?"<>|]/g, "_");
      link.download = `SIDE-B_${safe}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  /* ============================================================
     事件绑定
     ============================================================ */
  const hero = $("#hero");
  const studio = $("#studio");
  const result = $("#result");
  const emptyState = $("#emptyState");
  const moodInput = $("#moodInput");
  const saveNote = $("#saveNote");

  $("#startBtn").addEventListener("click", () => {
    hero.style.display = "none";
    studio.hidden = false;
    studio.classList.add("fade-in");
    moodInput.focus();
  });
  $("#backBtn").addEventListener("click", () => {
    studio.hidden = true;
    hero.style.display = "flex";
  });

  // 情绪选择
  $$(".emo-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$(".emo-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state.emotion = chip.dataset.emo;
    });
  });

  // 刻录
  $("#burnBtn").addEventListener("click", () => {
    state.userText = moodInput.value.trim();
    if (!state.emotion) {
      // 没选情绪时，按输入轻微猜测或随机
      const guess = guessEmotion(state.userText);
      state.emotion = guess;
      const c = $$(`.emo-chip`).find((x) => x.dataset.emo === guess);
      if (c) { $$(".emo-chip").forEach((x) => x.classList.remove("active")); c.classList.add("active"); }
    }
    generate();
    emptyState.hidden = true;
    result.hidden = false;
    result.classList.add("fade-in");
    // 停止可能正在播放的音乐（换情绪）
    if (Audio.playing) { Audio.stop(); $("#playBtn").classList.remove("playing"); }
  });

  function guessEmotion(text) {
    const map = {
      心动: ["喜欢", "爱", "心动", "甜", "脸红", "怦", "想念你", "想你"],
      想念: ["想", "念", "远方", "旧", "回忆", "月", "信", "你"],
      自由: ["自由", "逃", "浪", "风", "远", "出发", "海", "山"],
      遗憾: ["遗憾", "错过", "如果", "后悔", "散", "迟", "未完", "擦肩"],
    };
    for (const e in map) if (map[e].some((k) => text.includes(k))) return e;
    return pick(Object.keys(EMOTIONS));
  }

  // 模板切换
  $$(".tpl-btn").forEach((b) => {
    b.addEventListener("click", () => {
      $$(".tpl-btn").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      state.album.template = b.dataset.tpl;
      cover.className = `cover tpl-${b.dataset.tpl} emo-${state.album.emotion}`;
    });
  });

  // 贴纸托盘
  const tray = $("#stickerTray");
  STICKERS.forEach((em) => {
    const b = document.createElement("button");
    b.className = "st"; b.textContent = em; b.title = "点击添加到封面";
    b.addEventListener("click", () => addSticker(em));
    tray.appendChild(b);
  });

  // 播放 / 暂停
  const playBtn = $("#playBtn");
  playBtn.addEventListener("click", () => {
    if (Audio.playing) {
      Audio.stop();
      playBtn.classList.remove("playing");
    } else {
      Audio.play(state.album.emotion);
      playBtn.classList.add("playing");
    }
  });

  // 随机一张
  $("#shuffleBtn").addEventListener("click", () => {
    generate();
    if (Audio.playing) { Audio.stop(); playBtn.classList.remove("playing"); Audio.play(state.album.emotion); playBtn.classList.add("playing"); }
  });

  // 保存
  $("#saveBtn").addEventListener("click", () => {
    // 先确保字体已加载，避免导出字体回退
    const done = () => {
      exportPNG();
      saveNote.hidden = false;
      saveNote.textContent = "✓ 已生成 PNG，开始下载（若未自动保存，请检查浏览器下载权限）";
      setTimeout(() => (saveNote.hidden = true), 4000);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(done);
    else done();
  });

  // 初始空状态
  result.hidden = true;
})();
