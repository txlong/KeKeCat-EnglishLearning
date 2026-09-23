/* 可可猫 KeKeCat — 演示站脚本（数据均为演示内容，进度仅存本机 localStorage） */
"use strict";

/* ================= 演示课程数据 ================= */
const COURSES = [
  {
    id: "animals", zh: "动物", en: "Animals", emoji: "🐾", tint: "tint-teal",
    words: [
      { en: "cat", zh: "猫", emoji: "🐱", ipa: "/kæt/", say: "凯特" },
      { en: "dog", zh: "狗", emoji: "🐶", ipa: "/dɒɡ/", say: "道格" },
      { en: "bird", zh: "鸟", emoji: "🐦", ipa: "/bɜːrd/", say: "波德" },
      { en: "fish", zh: "鱼", emoji: "🐟", ipa: "/fɪʃ/", say: "菲什" },
      { en: "rabbit", zh: "兔子", emoji: "🐰", ipa: "/ˈræbɪt/", say: "拉-比特" },
      { en: "duck", zh: "鸭子", emoji: "🦆", ipa: "/dʌk/", say: "达克" },
    ],
  },
  {
    id: "colors", zh: "颜色", en: "Colors", emoji: "🎨", tint: "tint-pink",
    words: [
      { en: "red", zh: "红色", emoji: "🍅", ipa: "/red/", say: "瑞德" },
      { en: "blue", zh: "蓝色", emoji: "🫐", ipa: "/bluː/", say: "布鲁" },
      { en: "green", zh: "绿色", emoji: "🥒", ipa: "/ɡriːn/", say: "格林" },
      { en: "yellow", zh: "黄色", emoji: "🌻", ipa: "/ˈjeloʊ/", say: "耶娄" },
      { en: "pink", zh: "粉色", emoji: "🌸", ipa: "/pɪŋk/", say: "平克" },
      { en: "purple", zh: "紫色", emoji: "🍇", ipa: "/ˈpɜːrpl/", say: "珀-普尔" },
    ],
  },
  {
    id: "food", zh: "食物", en: "Food", emoji: "🍎", tint: "tint-gold",
    words: [
      { en: "apple", zh: "苹果", emoji: "🍎", ipa: "/ˈæpl/", say: "阿-普尔" },
      { en: "milk", zh: "牛奶", emoji: "🥛", ipa: "/mɪlk/", say: "米尔克" },
      { en: "egg", zh: "鸡蛋", emoji: "🥚", ipa: "/eɡ/", say: "艾格" },
      { en: "bread", zh: "面包", emoji: "🍞", ipa: "/bred/", say: "布瑞德" },
      { en: "banana", zh: "香蕉", emoji: "🍌", ipa: "/bəˈnænə/", say: "伯-那-那" },
      { en: "cake", zh: "蛋糕", emoji: "🍰", ipa: "/keɪk/", say: "凯克" },
    ],
  },
  {
    id: "family", zh: "家人", en: "Family", emoji: "🏠", tint: "tint-lav",
    words: [
      { en: "mom", zh: "妈妈", emoji: "👩", ipa: "/mɑːm/", say: "玛姆" },
      { en: "dad", zh: "爸爸", emoji: "👨", ipa: "/dæd/", say: "戴德" },
      { en: "sister", zh: "姐妹", emoji: "👧", ipa: "/ˈsɪstər/", say: "西斯-特" },
      { en: "brother", zh: "兄弟", emoji: "👦", ipa: "/ˈbrʌðər/", say: "布拉-泽" },
      { en: "baby", zh: "宝宝", emoji: "👶", ipa: "/ˈbeɪbi/", say: "贝-比" },
      { en: "grandma", zh: "奶奶/外婆", emoji: "👵", ipa: "/ˈɡrænmɑː/", say: "格兰-玛" },
    ],
  },
];

const ALL_WORDS = COURSES.flatMap((c) => c.words.map((w) => ({ ...w, course: c.id })));
const TOTAL_WORDS = ALL_WORDS.length;
const COURSE_BY_ID = Object.fromEntries(COURSES.map((c) => [c.id, c]));
const UNIT_SIZE = 3;

const PRAISE = [
  ["太棒了！", "Great job!"],
  ["真厉害！", "Awesome!"],
  ["答对啦！", "You got it!"],
  ["好聪明！", "So smart!"],
  ["完美！", "Perfect!"],
];
const ENCOURAGE = [
  ["没关系，再试一次就会啦！", "Nice try! Look — this is the right one."],
  ["差一点点，加油！", "Almost! Remember this word."],
  ["学习就是这样慢慢来的～", "Good try! Every mistake helps you learn."],
];

/* ================= 本机进度（localStorage，仅演示） ================= */
const STORE_KEY = "kekecat.demo.progress.v1";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadProgress() {
  const empty = { learned: {}, correct: {}, today: { date: todayStr(), learned: 0, correct: 0, sessions: 0 } };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return empty;
    const p = JSON.parse(raw);
    if (!p || typeof p !== "object") return empty;
    if (!p.today || p.today.date !== todayStr()) {
      p.today = { date: todayStr(), learned: 0, correct: 0, sessions: 0 };
    }
    return { learned: p.learned || {}, correct: p.correct || {}, today: p.today };
  } catch {
    return empty;
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(progress));
  } catch {
    /* 存储不可用时静默降级：进度仅保留在本次会话 */
  }
}

let progress = loadProgress();

function wordKey(w) { return `${w.course || ""}:${w.en}`; }
function isLearned(w) { return !!progress.learned[wordKey(w)]; }
function learnedCountOf(course) { return course.words.filter((w) => isLearned({ ...w, course: course.id })).length; }
function totalLearned() { return ALL_WORDS.filter(isLearned).length; }

function markLearned(w, wasCorrect) {
  const key = wordKey(w);
  if (!progress.learned[key]) {
    progress.learned[key] = true;
    progress.today.learned += 1;
  }
  if (wasCorrect) {
    progress.correct[key] = (progress.correct[key] || 0) + 1;
    progress.today.correct += 1;
  }
  saveProgress();
}

/* ================= 发音：优先语音合成，否则文本提示 ================= */
const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

function speak(word) {
  if (!synth) return false;
  try {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    u.rate = 0.75;
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}

function speechAvailable() {
  return !!(synth && typeof synth.speak === "function");
}

/* ================= 工具 ================= */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  for (const c of children) {
    if (c === null || c === undefined) continue;
    node.append(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

/* ================= 路由与视图 ================= */
const views = {
  home: document.getElementById("view-home"),
  courses: document.getElementById("view-courses"),
  course: document.getElementById("view-course"),
  practice: document.getElementById("view-practice"),
  "practice-pick": document.getElementById("view-practice-pick"),
};

const navLinks = Array.from(document.querySelectorAll(".main-nav a"));

function showView(name, navKey) {
  for (const [k, sec] of Object.entries(views)) {
    sec.hidden = k !== name;
  }
  for (const a of navLinks) {
    const key = a.dataset.nav;
    const active = key === (navKey || name);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  window.scrollTo({ top: 0 });
}

function route() {
  const hash = location.hash || "#/home";
  const parts = hash.replace(/^#\/?/, "").split("/");
  const [name, param] = parts;

  if (name === "course" && COURSE_BY_ID[param]) {
    renderCourseDetail(COURSE_BY_ID[param]);
    showView("course", "courses");
  } else if (name === "practice" && COURSE_BY_ID[param]) {
    startPractice(COURSE_BY_ID[param]);
    showView("practice");
  } else if (name === "practice") {
    renderPracticePick();
    showView("practice-pick", "practice");
  } else if (name === "courses") {
    renderCourseList();
    showView("courses");
  } else {
    renderHome();
    showView("home");
  }
}

window.addEventListener("hashchange", route);

/* ================= 课程卡片 ================= */
function courseCard(course, large) {
  const learned = learnedCountOf(course);
  const btn = el(
    "button",
    {
      type: "button",
      class: `course-card ${course.tint}`,
      "aria-label": `课程：${course.zh} ${course.en}，已学 ${learned}/${course.words.length} 个单词，查看详情`,
      onclick: () => { location.hash = `#/course/${course.id}`; },
    },
    el("span", { class: "c-emoji", "aria-hidden": "true" }, course.emoji),
    el("span", { class: "c-zh" }, course.zh),
    el("span", { class: "c-en" }, course.en),
    el("span", { class: "c-meta" },
      learned >= course.words.length ? "✅ 已学完 Learned!" : `已学 ${learned} / ${course.words.length} 个单词`)
  );
  return btn;
}

/* ================= 首页 ================= */
function renderHome() {
  const learned = totalLearned();
  const pct = Math.round((learned / TOTAL_WORDS) * 100);
  document.getElementById("learned-count").textContent = String(learned);
  document.getElementById("total-count").textContent = String(TOTAL_WORDS);
  const fill = document.getElementById("progress-fill");
  fill.style.width = pct + "%";
  document.getElementById("progress-bar-wrap").setAttribute("aria-valuenow", String(pct));

  const t = progress.today;
  const tasks = [
    { zh: "学 5 个单词", en: "Learn 5 words", cur: Math.min(t.learned, 5), goal: 5, icon: "📖" },
    { zh: "完成 1 次练习", en: "Finish 1 practice", cur: Math.min(t.sessions, 1), goal: 1, icon: "🎯" },
    { zh: "答对 8 题", en: "Answer 8 correctly", cur: Math.min(t.correct, 8), goal: 8, icon: "🌟" },
  ];
  const list = document.getElementById("task-list");
  list.textContent = "";
  for (const task of tasks) {
    const done = task.cur >= task.goal;
    list.append(
      el("li", { class: "task-item" + (done ? " done" : "") },
        el("span", { class: "task-check", "aria-hidden": "true" }, done ? "✓" : task.icon),
        el("span", {}, task.zh, el("span", { class: "task-label-en" }, task.en)),
        el("span", { class: "task-count" }, `${task.cur}/${task.goal}`))
    );
  }

  const grid = document.getElementById("course-grid");
  grid.textContent = "";
  for (const c of COURSES) grid.append(courseCard(c));
}

document.getElementById("btn-start").addEventListener("click", () => {
  const next = COURSES.find((c) => learnedCountOf(c) < c.words.length) || COURSES[0];
  location.hash = `#/practice/${next.id}`;
});

/* ================= 课程列表 / 练习选课程 ================= */
function renderCourseList() {
  const grid = document.getElementById("course-grid-full");
  grid.textContent = "";
  for (const c of COURSES) grid.append(courseCard(c));
}

function renderPracticePick() {
  const grid = document.getElementById("practice-pick-grid");
  grid.textContent = "";
  for (const c of COURSES) {
    grid.append(
      el("button", {
        type: "button",
        class: `course-card ${c.tint}`,
        "aria-label": `练习课程：${c.zh} ${c.en}`,
        onclick: () => { location.hash = `#/practice/${c.id}`; },
      },
        el("span", { class: "c-emoji", "aria-hidden": "true" }, c.emoji),
        el("span", { class: "c-zh" }, `练习 ${c.zh}`),
        el("span", { class: "c-en" }, `Practice ${c.en}`))
    );
  }
}

/* ================= 课程详情 ================= */
function renderCourseDetail(course) {
  const sec = views.course;
  sec.textContent = "";
  const learned = learnedCountOf(course);

  sec.append(
    el("a", { class: "back-link", href: "#/courses" }, "← 全部课程 All courses"),
    el("div", { class: "course-head card-soft" },
      el("span", { class: "c-emoji", "aria-hidden": "true" }, course.emoji),
      el("div", {},
        el("h1", { id: "course-title" }, `${course.zh}课程`),
        el("span", { class: "c-en" }, `${course.en} · 已学 ${learned}/${course.words.length} 个单词`)),
      el("div", { class: "course-head-actions" },
        el("a", { class: "btn btn-primary", href: `#/practice/${course.id}` },
          learned >= course.words.length ? "再练一遍 " : "继续学习 ",
          el("span", { class: "btn-en" }, learned >= course.words.length ? "Practice again" : "Continue"), " ▶")))
  );

  const unitGrid = el("div", { class: "unit-grid" });
  const units = [];
  for (let i = 0; i < course.words.length; i += UNIT_SIZE) {
    units.push(course.words.slice(i, i + UNIT_SIZE));
  }
  units.forEach((unitWords, idx) => {
    const doneInUnit = unitWords.filter((w) => isLearned({ ...w, course: course.id })).length;
    const wordList = el("ul", { class: "unit-words" });
    for (const w of unitWords) {
      const done = isLearned({ ...w, course: course.id });
      wordList.append(
        el("li", { class: "unit-word" },
          el("span", { class: "w-emoji", "aria-hidden": "true" }, w.emoji),
          el("span", { class: "w-en" }, w.en),
          el("span", { class: "w-zh" }, w.zh),
          done ? el("span", { class: "w-done", "aria-label": "已学会" }, "✓") : null)
      );
    }
    unitGrid.append(
      el("div", { class: "unit-card card-soft" },
        el("h3", {}, `第${idx + 1}单元`),
        el("span", { class: "unit-en" }, `Unit ${idx + 1} · ${unitWords.length} 个单词 words` +
          (doneInUnit === unitWords.length ? " · ✅ 已完成" : "")),
        wordList)
    );
  });
  sec.append(el("h2", { class: "section-title" }, "📖 课程单元 ", el("span", { class: "panel-en" }, "Units")), unitGrid);
}

/* ================= 单词练习 ================= */
let session = null;

function buildSession(course) {
  const withCourse = course.words.map((w) => ({ ...w, course: course.id }));
  const unlearned = withCourse.filter((w) => !isLearned(w));
  const order = unlearned.length
    ? shuffle(unlearned).concat(shuffle(withCourse.filter((w) => isLearned(w)))).slice(0, course.words.length)
    : shuffle(withCourse);
  return { course, queue: order, index: 0, correctCount: 0 };
}

function startPractice(course) {
  session = buildSession(course);
  progress.today.date === todayStr() || (progress.today = { date: todayStr(), learned: 0, correct: 0, sessions: progress.today.sessions });
  renderQuestion();
}

function pickOptions(answer) {
  const pool = shuffle(ALL_WORDS.filter((w) => w.en !== answer.en));
  return shuffle([answer, ...pool.slice(0, 3)]);
}

function renderQuestion() {
  const sec = views.practice;
  sec.textContent = "";
  const { course, queue, index } = session;

  if (index >= queue.length) {
    progress.today.sessions += 1;
    saveProgress();
    renderDone();
    return;
  }

  const word = queue[index];
  // 两种题型交替：看图选词 / 看词选图
  const mode = index % 2 === 0 ? "pic2word" : "word2pic";
  const options = pickOptions(word);
  const wrap = el("div", { class: "practice-wrap" });

  const stepsPct = Math.round((index / queue.length) * 100);
  wrap.append(
    el("div", { class: "practice-top" },
      el("a", { class: "back-link", href: `#/course/${course.id}`, style: "margin:0" }, "← 返回课程"),
      el("h1", { id: "practice-title" }, `${course.emoji} ${course.zh}练习 ${course.en}`),
      el("span", { class: "practice-steps", "aria-live": "polite" }, `第 ${index + 1} / ${queue.length} 题`)),
    el("div", { class: "steps-track", role: "progressbar", "aria-label": "练习进度",
      "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(stepsPct) },
      el("div", { class: "steps-fill", style: `width:${stepsP}%` }))
  );

  const card = el("div", { class: "quiz-card card-soft" });
  const feedback = el("div", { class: "feedback", "aria-live": "polite" });

  if (mode === "pic2word") {
    card.append(
      el("p", { class: "quiz-prompt" }, "看图选单词"),
      el("p", { class: "quiz-prompt-en" }, "Look at the picture and pick the right word"),
      el("div", { class: "word-stage" },
        el("span", { class: "word-emoji", "aria-hidden": "true" }, word.emoji),
        el("span", { style: "font-size:15px;color:var(--brown-soft)" }, `它是：${word.zh}`),
        el("div", { class: "sound-row" }, soundButtons(word)))
    );
  } else {
    card.append(
      el("p", { class: "quiz-prompt" }, "听一听，选出正确的图片"),
      el("p", { class: "quiz-prompt-en" }, "Listen and pick the right picture"),
      el("div", { class: "word-stage" },
        el("span", { class: "word-big" }, word.en),
        el("div", { class: "sound-row" }, soundButtons(word)))
    );
  }

  const grid = el("div", { class: "option-grid", role: "group", "aria-label": "答案选项" });
  let answered = null;
  const nextBtn = el("button", {
    type: "button", class: "btn btn-primary", hidden: "hidden",
    onclick: () => { session.index += 1; renderQuestion(); },
  }, "下一题 ", el("span", { class: "btn-en" }, "Next"), " →");

  for (const opt of options) {
    const isAnswer = opt.en === word.en;
    const btn = el("button", {
      type: "button", class: "option-btn",
      "aria-label": mode === "pic2word" ? `${opt.en}（${opt.zh}）` : `图片：${opt.zh}（${opt.en}）`,
      onclick: () => {
        if (answered !== null) return;
        answered = isAnswer;
        for (const b of grid.querySelectorAll(".option-btn")) b.disabled = true;
        if (isAnswer) {
          btn.classList.add("correct");
          const [zh, en] = PRAISE[Math.floor(Math.random() * PRAISE.length)];
          feedback.textContent = "";
          feedback.append(el("p", { class: "feedback-msg ok" }, `🎉 ${zh} ${en}`));
          session.correctCount += 1;
          markLearned(word, true);
          speak(word.en);
        } else {
          btn.classList.add("wrong");
          const rightBtn = grid.querySelector(`[data-en="${CSS.escape(word.en)}"]`);
          if (rightBtn) rightBtn.classList.add("correct");
          const [zh, en] = ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)];
          feedback.textContent = "";
          feedback.append(
            el("p", { class: "feedback-msg no" }, `💪 ${zh}`),
            el("p", { style: "margin:0;font-weight:700" }, `正确答案是：${word.emoji} ${word.en}（${word.zh}）`),
            el("p", { style: "margin:0" }, en));
          markLearned(word, false);
        }
        nextBtn.hidden = false;
        nextBtn.focus();
      },
    });
    btn.dataset.en = opt.en;
    if (mode === "pic2word") {
      btn.append(el("span", {}, opt.en), el("span", { class: "opt-sub" }, opt.zh));
    } else {
      btn.append(el("span", { class: "opt-emoji", "aria-hidden": "true" }, opt.emoji),
        el("span", { class: "opt-sub" }, `${opt.zh}`));
    }
    grid.append(btn);
  }

  card.append(grid, feedback, el("div", { style: "margin-top:16px" }, nextBtn));
  wrap.append(card);
  sec.append(wrap);
}

function soundButtons(word) {
  const hint = el("div", { class: "hint-bubble", hidden: "hidden" });
  const playBtn = el("button", {
    type: "button", class: "btn btn-pink",
    onclick: () => {
      const ok = speak(word.en);
      hint.hidden = false;
      if (!ok) {
        hint.textContent = "";
        hint.append("🔈 本机语音暂不可用，看文字发音提示吧：",
          el("span", { class: "ipa" }, ` ${word.ipa} `), `读作「${word.say}」`);
      }
    },
  }, "🔊 发音 ", el("span", { class: "btn-en" }, "Listen"));

  const hintBtn = el("button", {
    type: "button", class: "btn btn-ghost",
    onclick: () => {
      hint.hidden = !hint.hidden;
      if (!hint.hidden && !hint.childNodes.length) {
        hint.append(`🗣️ 发音提示：${word.en} `, el("span", { class: "ipa" }, word.ipa), ` 读作「${word.say}」`);
      }
      hintBtn.setAttribute("aria-expanded", String(!hint.hidden));
    },
    "aria-expanded": "false",
  }, "💡 怎么读 ", el("span", { class: "btn-en" }, "How to say"));

  if (!speechAvailable()) {
    playBtn.textContent = "";
    playBtn.append("🔇 无语音 ", el("span", { class: "btn-en" }, "Use text hint"));
    playBtn.addEventListener("click", () => {
      hint.hidden = false;
      hint.textContent = "";
      hint.append(`🗣️ ${word.en} ${word.ipa} 读作「${word.say}」`);
    });
  }

  return [playBtn, hintBtn, hint];
}

function renderDone() {
  const sec = views.practice;
  sec.textContent = "";
  const { course, queue, correctCount } = session;
  const total = queue.length;
  const ratio = total ? correctCount / total : 0;
  const stars = ratio >= 0.9 ? "⭐⭐⭐" : ratio >= 0.6 ? "⭐⭐" : "⭐";

  sec.append(
    el("div", { class: "practice-wrap" },
      el("div", { class: "done-card card-soft" },
        el("p", { class: "done-stars", "aria-hidden": "true" }, stars),
        el("h1", {}, "练完啦！You did it!"),
        el("p", {}, `本次答对 ${correctCount} / ${total} 题 · 已学会的单词都记进了你的进度里。`,
          el("br"), el("span", { class: "en-line" }, `${course.zh} ${course.en} practice complete. Your progress is saved on this device.`)),
        el("div", { class: "done-actions" },
          el("a", { class: "btn btn-primary", href: `#/practice/${course.id}` }, "再练一次 ", el("span", { class: "btn-en" }, "Again")),
          el("a", { class: "btn btn-pink", href: `#/course/${course.id}` }, "看课程 ", el("span", { class: "btn-en" }, "Course")),
          el("a", { class: "btn btn-ghost", href: "#/home" }, "回首页 ", el("span", { class: "btn-en" }, "Home")))))
  );
}

/* ================= 启动 ================= */
renderHome();
route();
